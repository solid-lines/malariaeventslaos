# malariaeventslaos
Script to move Malaria events between PSI Laos and MoH

#config.json file

https://hmis.gov.la/api/programStages/HVOPHnaZngk?fields=*,!organisationUnits,!programIndicators,programStageDataElements[*,dataElement[*]]
https://data.psi-mis.org/api/programStages/aRUlSh6oMSX?fields=*,!organisationUnits,!programIndicators,programStageDataElements[*,dataElement[*]]

program {origin: destination}
programStage {origin: destination}

deMapping{
   uid_datalement_origin :[{ 
                "mapping": "uid_datalement_destination",
                "optionSet": "uid_optionSet_origin"
            }, {
                "mapping": "uid_datalement_destination",
                "value": "uid_optionSet_origin"
            }]
}

"customValues": [{
		"deId": "RtfqjYAlhsa", #uid_datalement_destination (MAL: Suspected Malaria Case)
		"value": "true"
	}
]

"values": {
	"uid_optionSet_origin": {
		"option_code_origin": "de_value_destination",
		"option_code_origin": "de_value_destination",
		"option_code_origin": "de_value_destination",
	},
"optionSets": {
	"uid_optionSet_origin": {
		"option_code_origin": "de_value_destination",
		"option_code_origin": "de_value_destination",
		"option_code_origin": "de_value_destination",
	},


Treatment origin TzL693oH3D9 (not compulsory)
Treatment result origin QRbMgIHc9QB (not compulsory). Uses optionSet mdE8zrlVRVf

How to run
----------

1) update config.json file
2) run 'node index.js'