# malariaeventslaos
Script to move Malaria events between PSI Laos and MoH

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