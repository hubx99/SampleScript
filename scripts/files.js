var fs = require('fs');
var path = require('path');

var files = [];

function scandir(dir) {
	var list = fs.readdirSync(dir);
	for (var i=0; i<list.length; i++) {
		var file = path.join(dir, list[i]);
		if (fs.statSync(file).isFile()) {
			files.push(file);
		} else {
			scandir(file);
		}
	}
}

scandir('.');

files.filter(function(f) {
	return /.*\.txt$/.test(f);
})
.forEach(function(f) {
	console.log(f);
});
