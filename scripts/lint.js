var drafter = require('drafter');
var fs = require('fs');
var util = require('util')

try {

    const content = fs.readFileSync('apiary.apib', 'utf8');

    const options = {};
    var result = drafter.validateSync(content.replace(/\r\n/g, '\n'), options);
    if (!result) {
        console.log("valid");
    }
    else {
        console.log(util.inspect(result, false, 20));
        process.exit(2);
    }
} catch (err) {
    console.error(err);
    process.exit(1);
}