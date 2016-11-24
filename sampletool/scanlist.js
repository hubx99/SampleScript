var fs = require('fs');
var path = require('path');
var xlsx = require('xlsx');
var ejs = require('ejs');

var files = [];
var sumsize = 0;

function isTargetFile(file) {
	return /.*\.xls[xm]$/.test(file);
}

function scandir(dir) {
	var list = fs.readdirSync(dir);
	for (var i=0; i<list.length; i++) {
		var file = path.join(dir, list[i]);
		var stat = fs.statSync(file);
		if (stat.isFile()) {
			if (isTargetFile(file)) {
				files.push({
					fname: file,
					fsize: stat["size"]
				});
				sumsize += stat["size"];
			}
		} else {
			scandir(file);
		}
	}
}

function dateformat(d) {
	var dv = [
		d.getFullYear(),
		("0" + (d.getMonth() + 1)).substr(-2),
		("0" + d.getDate()).substr(-2)
	];
	var tv = [
		("0" + d.getHours()).substr(-2),
		("0" + d.getMinutes()).substr(-2),
		("0" + d.getSeconds()).substr(-2)
	]
	return dv.join("/") + " " + tv.join(":");
}

var tabhist;
try {
	tabhist = JSON.parse(fs.readFileSync('hist.json', 'utf8'));
} catch (e) {
	tabhist = {};
}


scandir('.');

var sheetIndex = 0;
var pickupCell = ['B2'];
var logdata = {};

for (var i=0; i<files.length; i++) {
	var fname = files[i].fname;

	files[i].sizePercent = Math.floor((files[i].fsize / sumsize * 1000)) / 10;
	logdata[fname] = files[i].fsize;

	files[i].hist = parseInt(tabhist[fname]);
	if (isNaN(files[i].hist)) {
		files[i].hist = "0";
	}

	files[i].diff = files[i].fsize - files[i].hist;
	if (files[i].diff === 0) {
		//files[i].diff = "+-";
	} else if (files[i].diff > 0) {
		files[i].diff = "+" + files[i].diff;
		files[i].status = "hot";
	} else {
		files[i].status = "cold";
	}

	var workbook = xlsx.readFile(fname);
	var sheet = workbook.SheetNames[sheetIndex];
	var worksheet = workbook.Sheets[sheet];

	files[i].cell = [];
	for (var j=0; j<pickupCell.length; j++) {
		var key = pickupCell[j];
		var cell = worksheet[key];
		if (cell) {
			files[i].cell[key] = cell.v;
		} else {
			files[i].cell[key] = null;
		}
	}
}

var template = fs.readFileSync('template.ejs', 'utf8');
var html = ejs.render(template, {
	time: dateformat(new Date()),
    list: files
});

fs.writeFileSync("hist.json", JSON.stringify(logdata, null, "    "), 'utf8');

console.log(html);
