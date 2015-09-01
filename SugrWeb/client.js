var rest = require('restler')
var fs = require('fs');

var SugrApiUrl = 'https://hello.mysugr.com/app/rest/v2'
var cookies = "SPRING_SECURITY_REMEMBER_ME_COOKIE=" + process.env.TOKEN

function downloadReport(from, to) {
    var toEpoch   = parseInt(to.getTime() / 1000)
    var fromEpoch = parseInt(from.getTime() / 1000)
    var params = 'dateOfEntryFrom=' + fromEpoch + '&dateOfEntryTo=' + toEpoch

    console.log('requesting pdf... ')
    rest.get(SugrApiUrl + '/export/download/pdf?' + params, {
        headers: { Cookie: cookies, "User-Agent": 'QuickSugr' }
        }).on('complete', function (data, response) {
            if (response.statusCode != 200) {
                console.log("error: " + response.statusCode)
                return
            }

            var regex = new RegExp(/filename=(.*).pdf/)
            var matchs = response.headers['content-disposition'].match(regex)
            var outFile = matchs[1] + '.pdf'
            console.log('saving to ' + outFile)
            fs.writeFileSync(outFile, response.raw)
        });
}

var from = new Date(2015, 7, 14, 0, 0, 0, 0)    // 2015/08/14
var to = new Date(2015, 7, 28, 0, 0, 0, 0)      // 2015/08/28
downloadReport(from, to)
