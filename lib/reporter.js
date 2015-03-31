/* global module */

(function(module){
	
	"use strict";
	
	var Table = require('cli-table');
	var chalk = require("chalk");
	
	module.exports = function(results) {
		
		if (!results.bundleStats || !results.bundleStats.length) {
			console.log(chalk.yellow("No results found"));
			return;
		}
		
		results.bundleStats.forEach(function(bundle){
			
			console.log(chalk.magenta("BUNDLE: " + bundle.NAME + ":"));
			
			bundle.SUITESTATS.forEach(function(suite){
				
				console.log("SUITE: " + chalk.cyan(suite.NAME + ":"));
				
				var table = new Table({
					head: ['Test Name', 'Time', 'Status', 'Message'],
					style: {
						head: [ "blue" ]
					}
				});
				
				suite.SPECSTATS.forEach(function(spec){
					
					var time = spec.TOTALDURATION.toString() + "ms";
					var name = spec.NAME;
					var status = "";
					var message = "";
					
					switch(spec.STATUS) {
						
						case "Passed":
							status = chalk.green("Passed");
							message = "";
							break;
							
						case "Failed":
							status = chalk.yellow("Failed");
							message = spec.FAILMESSAGE;
							break;
							
						case "Error":
							status = chalk.red("Error");
							message = spec.ERROR.Message;
							break;

					}
					
					table.push([ name, time, status, message ]);
					
				});
				
				console.log(table.toString());
				
			});
			
		});
		
	};
	
})(module);