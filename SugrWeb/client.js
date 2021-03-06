/*
  node.js client for MySugr web app.
  Copyright 2015 Benito Palacios Sánchez (aka pleonex)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var rest = require('restler')

// Function to get login cookie token.
function login(user, pwd, complete) {
    var loginUrl = 'https://hello.mysugr.com/app/login/j_spring_security_check'
    var postData = {
        'j_username': user,
        'j_password': pwd,
        '_spring_security_remember_me': 'on'
    }

    rest.post(loginUrl, { data: postData, followRedirects: false })
        .on('complete', function(data, response) {
            var regex = /SPRING_SECURITY_REMEMBER_ME_COOKIE=([A-Za-z0-9]*);/
            var token = regex.exec(response.headers['set-cookie'])[1]
            complete(token)
    })
}

MySugr = rest.service(function(token) {
    this.defaults.headers = {
        Cookie: 'SPRING_SECURITY_REMEMBER_ME_COOKIE=' + token,
        'User-Agent': 'QuickSugr'
    }
}, {
    baseURL: 'https://hello.mysugr.com'
}, {
    // Function to download the report as PDF.
    downloadReport: function(fromDate, toDate) {
        var toEpoch   = parseInt(toDate.getTime() / 1000)
        var fromEpoch = parseInt(fromDate.getTime() / 1000)

        this.get('/app/rest/v2/export/download/pdf', {
                query: {
                    dateOfEntryFrom: fromEpoch,
                    dateOfEntryTo: toEpoch
                } })
            .on('complete', function (data, response) {
                if (response.statusCode != 200) {
                    console.log("error: " + response.statusCode)
                    return
                }

                var regex = new RegExp(/filename=(.*).pdf/)
                var matchs = response.headers['content-disposition'].match(regex)
                var outFile = matchs[1] + '.pdf'

                console.log('saving to ' + outFile)
                var fs = require('fs')
                fs.writeFileSync(outFile, response.raw)
            });
    },

    // Function to add an entry
    addEntry: function(entry) {
        var uuid = require('uuid')()
        return this.put('/app/rest/v2/logentries/' + uuid,
                        { data: {'logentry': entry} })
    }
})

var args = process.argv.slice(2)
var token = process.env.SUGR_TOKEN

// If there is no token set or the argument --login is passed, login
if (token == null || (args.length == 1 && args[0] == "--login")) {
    // Ask user and password
    var read = require('read')
    read({ prompt: 'E-mail: '}, function(er, email) {
        read({ prompt: 'Password: ', silent: true }, function(er, password) {
            console.log('login...')
            login(email, password, function(token) { console.log(token) })
        })
    })

    return
}

// Create the rest client
var client = new MySugr(token)

// Download the pdf as report
console.log('requesting report...')
var fromDate = new Date(2015, 8, 28, 0, 0, 0, 0)    // 2015/09/28
var toDate = new Date(2015, 9, 4, 0, 0, 0, 0)       // 2015/10/04
client.downloadReport(fromDate, toDate)

// Example entry
var logentry = {
    "id": "82d26581-ab96-448b-bac2-260f13b4cd3a",
    "createdAt": null,
    "dateOfEntryUtcOffsetSeconds": 7200,
    "dateOfEntryLocal": 1443815880,
    "dateOfEntry": 1443808680,
    "tags": [
        { "name":"correction" }
    ],
    "locationLatitude": null,
    "locationLongitude": null,
    "locationText": "Calle YerbagÃ¼ena, 28, Granada, Spain",
    "locationType": null,
    "bloodGlucoseMeasurement": 319,
    "pumpTemporaryBasalPercentage": null,
    "pumpTemporaryBasalDuration": null,
    "pumpBolusNormalUnits": null,
    "penBolusInjectionUnits": null,
    "penBasalInjectionUnits": null,
    "bolusFoodInsulinUnits": null,
    "bolusCorrectionInsulinUnits": 4,
    "mealCarbohydrates": null,
    "mealDescriptionText": null,
    "exerciseDescriptionText": null,
    "exerciseDuration": null,
    "exerciseIntensity": null,
    "stepsCount": null,
    "bloodPressureSystolic": null,
    "bloodPressureDiastolic": null,
    "bodyWeight": null,
    "hbA1c": null,
    "ketones": null,
    "isFavorite": null,
    "isTemplate": null,
    "points": 5,
    "weatherTemperature": null,
    "weatherCondition": null,
    "verifications": [],
    "nutritionalConstituents": null,
    "medications": null,
    "note": null
}
