# malariaeventslaos
Script to move Malaria events between PSI Laos and MoH

#missing District PPM Code
- Laos is divided into Provinces -> Districts.
- Inside Districts, there are the PPM (Publi/Private Clinics).
- Some PPM (that are included in a org. unit group) are the ones that made the Malaria tests.
- The Lao MoH dhis2 server has NOT PPMs, BUT it has the same Provinces and Districts than PSI dhis2 instance
- For all districts a generic PPM org unit was created with this code: {District Name}_{Province Code}_PPM. 
- That implies that all PSI PPMs that reports malaria cases inside a district are mapped against the same Org Unit of the MoH.
- In PSI dhis2 instance, the Custom Attribute DistrictCodePPM MUST be filled in each Org Unit that report malaria cases. And the code MUST be the Lao MoH code generated {District Name}_{Province Code}_PPM


#config.json file

https://hmis.gov.la/api/programStages/HVOPHnaZngk?fields=*,!organisationUnits,!programIndicators,programStageDataElements[*,dataElement[*]]
https://data.psi-mis.org/api/programStages/aRUlSh6oMSX?fields=*,!organisationUnits,!programIndicators,programStageDataElements[*,dataElement[*]]

program {source: destination}
programStage {source: destination}
```json
"deMapping": {
   "uid_datalement_source" :[{
	   			"#comment": "This is the simplest mapping",
                "mapping": "uid_datalement_destination",
            }],
   "uid_datalement_source" :[{ 
                "mapping": "uid_datalement_destination",
                "optionSet": "uid_optionSet_source"
            }],
   "uid_datalement_source" :[{ 
                "mapping": "uid_datalement_destination",
                "optionSet": "uid_optionSet_source"
            }, {
                "mapping": "uid_datalement_destination",
                "value": "uid_optionSet_source"
            }],
}, 

"customValues": [{
		"#comment": "#uid_datalement_destination (MAL: Suspected Malaria Case)",
		"deId": "RtfqjYAlhsa", 
		"value": "true"
	}
]

"values": {
	"uid_optionSet_source": {
		"option_code_source": "de_value_destination",
		"option_code_source": "de_value_destination",
		"option_code_source": "de_value_destination",
	},
"optionSets": {
	"uid_optionSet_source": {
		"option_code_source": "de_value_destination",
		"option_code_source": "de_value_destination",
		"option_code_source": "de_value_destination",
	},
```

Treatment source TzL693oH3D9 (not compulsory)
Treatment result source QRbMgIHc9QB (not compulsory). Uses optionSet mdE8zrlVRVf

How to run
----------

1) update config.json file
2) run 'node index.js'