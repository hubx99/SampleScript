
var http = require("http");
var fs = require("fs");
var querystring = require("querystring")

var tab = {};

http.createServer(function(request, response) {
	console.log(request.url);

	if (request.url === "/") {
		if (request.method === "GET") {
			response.writeHead(200, {
				"Content-Type": "text/html"
			});
			response.write(fs.readFileSync("index.html"));
			response.end();
		} else {
			var postData = "";
			request.on("data", function(chunk) {
				postData += chunk;
			});
			request.on("end", function() {
				var query = querystring.parse(postData);
				var xkey = query.meth + "_" + query.path;
				tab[xkey] = {
					status:  query.status,
					body:    query.body,
					type:    query.type
				};
				if (query.headkey) {
					tab[xkey]["header"] = {
						key: query.headkey,
						val: query.headval
					};
				}
				if (query.headkey2) {
					tab[xkey]["header2"] = {
						key: query.headkey2,
						val: query.headval2
					};
				}

				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write(JSON.stringify(tab, null, "    "));
				response.end();
			});
		}
	} else if ((request.method + "_" + request.url) in tab) {
		var x = tab[(request.method + "_" + request.url)];
		var headers = {};
		if (x.header) {
			headers[x.header.key] = x.header.val;
		}
		if (x.header2) {
			headers[x.header2.key] = x.header2.val;
		}
		response.writeHead(x.status, headers);
		response.end(x.body);
	} else {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.end("404");
	}

}).listen(7777);

