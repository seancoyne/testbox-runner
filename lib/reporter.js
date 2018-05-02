/* global module */

(function(module){
	
	"use strict";
	
	var Table = require('cli-table');
	var chalk = require("chalk");
	
	var outputSpec = function(spec, table, config){

		if ( config.errorsOnly && spec.status === "Passed" ) {
			return;
		}
		
		var time = spec.totalDuration.toString() + "ms";
		var name = spec.name;
		var status = "";
		var message = "";
		
		switch(spec.status) {
			
			case "Passed":
				status = chalk.green("Passed");
				message = "";
				break;
				
			case "Failed":
				status = chalk.yellow("Failed");
				message = spec.failMessage;
				break;
				
			case "Error":
				status = chalk.red("Error");
				message = spec.error.Message;
				break;

		}
		
		table.push([ name, time, status, message ]);

	};
	
	var outputSuite = function(suite, config) {
		if ( config.errorsOnly && ! suite.suiteStats.length &&
			! suite.totalError && ! suite.totalFail ) {
			return;
		}
	
		if ( suite.specStats.length ) {
			var table = new Table({
				head: ['Test Name', 'Time', 'Status', 'Message'],
				style: {
					head: [ "blue" ]
				}
			});

			suite.specStats.forEach(function(spec){
				outputSpec(spec, table, config);
			});

			console.log("SUITE: " + chalk.cyan(suite.name + ":"));
			console.log(table.toString());
			console.log();
		}
		
		suite.suiteStats.forEach(function(nestedSuite) {
			outputSuite(nestedSuite, config);
		});
		
	};
	
	var outputBundle = function(bundle, config) {
	
		if ( config.errorsOnly && ! bundle.totalFail && ! bundle.totalError ) {
			return;
		};
		
		console.log(chalk.magenta("BUNDLE: " + bundle.name + ":"));

		if ( bundle.globalException ) {
			var table = new Table({
				head: ['Test Name', 'Status', 'Message'],
				style: {
					head: [ "blue" ]
				}
			});
			var name = "Global Exception";
			var status = chalk.red("Error");
			var message = bundle.globalException.Message;
			table.push([ name, status, message ]);
			console.log(table.toString());		
		}

		bundle.suiteStats.forEach(function(suite) {
			outputSuite(suite, config);
		});
	};

	var outputSummary = function(results, config) {
		var stats = results.bundleStats.reduce(function(stats, bundle) {
			if (bundle.totalError > 0) { stats[2].amount++; }
			else if (bundle.totalFail > 0) { stats[1].amount++; }
			else { stats[0].amount++; }
			return stats;
		}, [
			{ type: "passed", amount: 0, color: "green" },
			{ type: "failed", amount: 0, color: "red" },
			{ type: "error", amount: 0, color: "red" }
		] );

		var statsString = stats.reduce(function(statsArr, stat) {
			if (stat.amount > 0) {
				statsArr.push(chalk[stat.color](stat.amount + " " + stat.type));
			}
			return statsArr;
		}, []).join(", ");
		var testSuiteSummary = chalk.bold("Test Suites: ") + statsString + ", " + results.totalBundles + " total.";

		var testsStats = [
			{ type: "passed", amount: results.totalPass, color: "green" },
			{ type: "failed", amount: results.totalFail, color: "red" },
			{ type: "error", amount: results.totalError, color: "red" }
		];
		var testsString = testsStats.reduce(function(statsArr, stat) {
			if (stat.amount > 0) {
				statsArr.push(chalk[stat.color](stat.amount + " " + stat.type));
			}
			return statsArr;
		}, []).join(", ");
		var testsSummary = chalk.bold("Tests: ") + testsString + ", " + results.totalPass + " total.";

		console.log();
		console.log(chalk.bold.inverse("------------------------------"));
		console.log(chalk.bold.inverse("-------- Test Summary --------"));
		console.log(chalk.bold.inverse("------------------------------"));
		console.log(testSuiteSummary);
		console.log(testsSummary);
		console.log(chalk.bold("Duration: ") + results.totalDuration + "ms");
		console.log();
	};
	
	module.exports = function(results, config) {
		
		if (!results.bundleStats || !results.bundleStats.length) {
			console.log(chalk.yellow("No results found"));
			return;
		}
		
		results.bundleStats.forEach(function(bundle) {
			outputBundle(bundle, config);
		});

		outputSummary(results, config);
	};
	
})(module);