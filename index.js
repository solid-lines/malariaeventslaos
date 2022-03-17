const { sinceDays } = require("./config.json").psi;
const {
  saveFile,
  getOrgs,
  getEvents,
  transform,
  filterStatus,
  pushData,
  updateStatus
} = require("./utils.js");

const moment = require("moment");

(async () => {
  const startDate = moment()
    .subtract(sinceDays, "days")
    .format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");

  let data = await getEvents(startDate, endDate);
  let orgs = await getOrgs();
  let pendingData = filterStatus(data, ["Rejected", "Pendding"]); //Pendding
  let pushD = transform(pendingData, orgs);
  saveFile(pushD, "payload")
  let response = await pushData(pushD);
  saveFile(response, "response")
  updateStatus(response, pendingData);
})();
