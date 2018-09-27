/* global module */
(function(module){
	
	"use strict";
	
	var request = require('request');
	var url = require("url");
	var querystring = require("querystring");
	var cheerio = require('cheerio');
	
	var noop = function(){};

	var keysToUpper = function (obj) {
		var output = {};
		for (var i in obj) {
			if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
				output[i.toUpperCase()] = keysToUpper(obj[i]);
			} else if(Object.prototype.toString.apply(obj[i]) === '[object Array]'){
				output[i.toUpperCase()] = [];
				for (var arrayIndex in obj[i]) {
					output[i.toUpperCase()].push(keysToUpper(obj[i][arrayIndex]));
				}
			} else {
				output[i.toUpperCase()] = obj[i];
			}
		}
		return output;
	};

	module.exports = function(config, before, after) {
		
		before = before || noop;
		after = after || noop;
		
		var uri = url.parse(config.runner);
		
		var qs = {
			reporter: "JSON"
		};
		
		if (config.directory) {
			qs.directory = config.directory;
			qs.recurse = config.recurse || false;
		}
		
		if (config.labels) {
			qs.labels = config.labels;
		}
		
		if (config.bundles) {
			qs.bundles = config.bundles;
		}
		
		uri.search = querystring.stringify(qs);
		
		var runnerURL = url.format(uri);
		
		before(runnerURL);
		
		request({ url: runnerURL, json: true }, function(error, response, body){

			if (body != undefined) {
				body = keysToUpper(body);
			} else {
				error = "Not a JSON response...";
			}

			if (response != undefined && response.statusCode != 200) {
				if (body != undefined) {
					var $ = cheerio.load(body);
					var genericErrorText = $("#textSection1").text().trim();
					var stackTrace = $("body > table > tbody > tr:nth-child(4) > td > font > table:nth-child(1) > tbody > tr:nth-child(4) > td > font").text().replace(/\t/g, '');
					var proximity = $("body > table > tbody > tr:nth-child(4) > td > font > table:nth-child(1) > tbody > tr:nth-child(5) > td > pre").text();
					error = "Error: " + genericErrorText + '\n' + "Stack Trace: " + stackTrace + "\n" + "Near: " + proximity;
				} else {
					error = "No valid response received!"
				}
			}
			after(error, body);
		});
	};
	
})(module);