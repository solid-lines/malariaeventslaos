const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const moment = require("moment");
var fs = require('fs');
var util = require('util');

const { psi, hmis } = require("./config.json");

const {
  deMapping,
  optionSets,
  values,
  customValues,
  programStage,
  program
} = require("./config.json");

// Logger
var logFile = fs.createWriteStream("./malariaeventlaos.log", { flags: 'a' });
// Or 'w' to truncate the file every time the process starts.
var logStdout = process.stdout;

console.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;
console.info = console.log;

const createAuthenticationHeader = (username, password) => {
  return "Basic " + new Buffer(username + ":" + password).toString("base64");
};

const getOrgs = async () => {
  let result = await fetch(
    `${
      psi.baseUrl
    }/api/programs/RjBwXyc5I66.json?fields=organisationUnits[id,name,level,displayName,attributeValues,geometry]&paging=false`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: createAuthenticationHeader(psi.username, psi.password)
      }
    }
  ).then(function(res) {
    return res;
  });
  let json = await result.json();
  //   let payload = {
  //     organisationUnits: []
  //   };
  //   json.organisationUnitGroups.forEach((value, key) => {
  //     payload.organisationUnits = payload.organisationUnits.concat(
  //       value.organisationUnits
  //     );
  //   });
  return json;
};

const getEvents = async (startDate, endDate) => {
  console.log("getEvents");
  let result = await fetch(
    `${
      psi.baseUrl
    }/api/events.json?program=RjBwXyc5I66&startDate=${startDate}&endDate=${endDate}&skipPaging=true`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: createAuthenticationHeader(psi.username, psi.password)
      }
    }
  ).then(function(res) {
    return res;
  });

  let json = await result.json();
  return json;
};

const filterStatus = (data, status) => {
  console.log("filterStatus");
  return data.events.filter(x =>
    x.dataValues.find(y => status.includes(y.value))
  );
};

const transform = (cases, orgs) => {
  console.log("transform");
  console.log(JSON.stringify(cases));
  let payload = {
    events: []
  };

  cases.forEach(c => {
    let orgsCode = orgs.organisationUnits.find(x => x.id == c["orgUnit"]);
    let districtCodePPM = null;
    if (orgsCode != null) {
      let attr = orgsCode.attributeValues.find(y => y.attribute.id == "gSL5sQyjxfP");
      if (attr != null) {
        districtCodePPM = attr.value;
      }
    }
    console.log("orgsCode")
    console.log(orgsCode)

    let event = {
      event: c["event"],
      eventDate: c["eventDate"],
      // orgUnit: c["orgUnit"],
      orgUnit: districtCodePPM,
      program: program[c["program"]],
      programStage: programStage[c["programStage"]],
      dataValues: []
    };

    if (orgsCode["geometry"] && orgsCode["geometry"]["type"] == "Point") {
      const latitude = orgsCode["geometry"]["coordinates"][1]
      const longitude = orgsCode["geometry"]["coordinates"][0]
      event['coordinate'] = {
        latitude: latitude,
        longitude: longitude
      };
      event['geometry'] ={
          type: "Point",
          coordinates: [longitude, latitude]
      }
    } else {
      // There is a value needed for geometry (dhis2 2.35)
      event['geometry'] = null
    }

    // Mapping data elements
    for (var key in deMapping) {
      let de = c.dataValues.find(x => x.dataElement == `${key}`);
      if (de != null) {
        deMapping[key].forEach(dMap => {
          let dataValue = {};
          dataValue["dataElement"] = dMap.mapping;
          if (dMap.optionSet) {
            dataValue["value"] = optionSets[dMap.optionSet][de.value];
          } else if (dMap.value) {
            if (values[dMap.value][de.value]) {
              dataValue["value"] = values[dMap.value][de.value];
            }
          } else {
            dataValue["value"] = de.value;
          }
          if (
            Object.keys(dataValue).length !== 0 &&
            dataValue.constructor === Object &&
            dataValue["value"] != null
          ) {
            event.dataValues.push(dataValue);
          }
        });
      }
    }

    // Custom data elements
    if (customValues.length > 0) {
      customValues.forEach(d => {
        let dataValue = {};
        dataValue["dataElement"] = d.deId;
        if (d.deId === "iboStpxyG6j") { // MAL: Case outcome
          let _treatment = c.dataValues.find(x => x.dataElement == `TzL693oH3D9`);
          let _treatmentResult = c.dataValues.find(x => x.dataElement == `QRbMgIHc9QB`);

          // destination optionSet https://hmis.gov.la/api/optionSets/Czn7rwBZvzS?format=json&fields=*,options[*]
          console.log("treatment")
          if (_treatment){
            console.log(_treatment.value);
          }else {
            console.log(_treatment);
          }
          console.log("_treatmentResult")
          if (_treatmentResult){
            console.log(_treatmentResult.value);
          }else {
            console.log(_treatmentResult);
          }

          if (_treatment === undefined && _treatmentResult === undefined){
            //no send
          } else if ( (_treatment != undefined) && ((_treatmentResult === undefined) || _treatmentResult.value === "Gohome") ) {
            dataValue["value"] = "Treated";
            event.dataValues.push(dataValue);
          } else if ( (_treatment === undefined) && (_treatmentResult.value === "Referred") ) {
            dataValue["value"] = "Refer";
            event.dataValues.push(dataValue);
          } else if ( (_treatment != undefined) && (_treatmentResult.value === "Referred") ) {
            dataValue["value"] = "Refer";
            event.dataValues.push(dataValue);
          }
          console.log(dataValue["value"])
          console.log("-----------------------------------------------------------")
        } else {
          dataValue["value"] = d.value;
        }
      });
    }

    // MAL - Type of Surveillance data elements
    // https://hmis.gov.la/api/dataElements/PUPinvzteXW
    event.dataValues.push({
      dataElement: "PUPinvzteXW",
      value: orgsCode["level"] === 5 ? "ACD" : "PCD"
    });

    if (districtCodePPM != null) {
      payload.events.push(event);
    } else {
      // UPDATE unsuitable events
      let status = c["dataValues"].find(x => x.dataElement == `MLbNyweMihi`);
      status["value"] = "Rejected";
      c["dataValues"].push({
        dataElement: "hjSIBxruyJA", // origin_de_uid: LA - Sync error message https://data.psi-mis.org/api/dataElements/hjSIBxruyJA
        value: "District Code PPM doesn't exist"
      });
      console.error("ERROR: Dismissed Event "+c['event']+" with orgUnit ("+c['orgUnit']+") because it has not a District Code PPM");
    }
  });
  return payload;
};

const updateStatus = async (res, data) => {
  console.log("STEP: updateStatus");
  console.log("response");
  console.log(JSON.stringify(res));
  console.log("original event");
  console.log(JSON.stringify(data));
  let payload = {
    events: []
  };

  if (
    res.response.importSummaries == null ||
    res.response.importSummaries.length < 1
  ) {
    console.log(
      "Something go wrong! The reason may be NO 'Pending Event' from source side or can't push events to destination!"
    );
    console.log(JSON.stringify(res));
    return;
  }

  res.response.importSummaries.forEach((re, index) => {
    let event = data.find(x => x.event == re.reference);
    if (event == null) return;
    let status = event.dataValues.find(x => x.dataElement == `MLbNyweMihi`);
    status["value"] = re.status == "SUCCESS" ? "Synced" : "Rejected";
    if (status["value"] === "Synced") {
      event.dataValues.push({
        dataElement: "N5B5r1okTqq",
        value: moment().format("YYYY-MM-DDTHH:mm:ss")
      });
    } else {
      event.dataValues.push({
        dataElement: "hjSIBxruyJA", // origin_de_uid: LA - Sync error message https://data.psi-mis.org/api/dataElements/hjSIBxruyJA
        value: re.description
      });
    }
    payload.events.push(event);
  });
  console.log("updated payload");
  console.log(JSON.stringify(payload));
  await fetch(psi.baseUrl + "/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: createAuthenticationHeader(psi.username, psi.password)
    },
    body: JSON.stringify(payload)
  })
    .then(function(res) {
      return res.json();
    })
    .then(json => {
      console.log(JSON.stringify(json));
      console.log("Update status done!!");
    });
};

const pushData = async data => {
  const url = `${hmis.baseUrl}/api/events?orgUnitIdScheme=CODE`
  console.log("Sending data")
  console.log(url)
  console.log(JSON.stringify(data))
  let result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: createAuthenticationHeader(hmis.username, hmis.password)
    },
    body: JSON.stringify(data)
  }).then(function(res) {
    return res;
  });
  let json = await result.json();
  console.log("Push events done!!");
  return json;
};

module.exports = {
  getOrgs,
  getEvents,
  transform,
  filterStatus,
  pushData,
  updateStatus
};
