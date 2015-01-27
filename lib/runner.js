/* global module */
(function(module){
	
	"use strict";
	
	var request = require('request');
	var url = require("url");
	var querystring = require("querystring");
	
	var noop = function(){};
	
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
			after(error, body);
		});
		
	};
	
})(module);