var drafter = require('drafter');
var fs = require('fs');

try {

    const content = fs.readFileSync('apiary.apib', 'utf8');

    const options = {};
    var result = drafter.validateSync(content.replace(/\r\n/g, '\n'), options);
    if (!result) {
        console.log("valid");
    }
    else {
        console.log(result);
        process.exit(2);
    }
} catch (err) {
    console.error(err);
    process.exit(1);
}