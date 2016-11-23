
if (process.argv.length < 3) {
	console.log('argument: excel file');
	process.exit(0);
}

var fname = process.argv[2];
console.log(fname);

var xlsx = require('xlsx');
var workbook = xlsx.readFile(fname);

var sheetIndex = 0;
var cellAddr = 'B3';

var sheet = workbook.SheetNames[sheetIndex];
console.log(sheet);

var worksheet = workbook.Sheets[sheet];
var cell = worksheet[cellAddr];
if (cell) {
	console.log(cell.v);
}
