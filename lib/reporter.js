/* global module */

(function(module){
	
	"use strict";
	
	var Table = require('cli-table');
	var chalk = require("chalk");
	
	var outputSpec = function(spec, table, config){

		if ( config.errorsOnly && spec.STATUS === "Passed" ) {
			return;
		}
		
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

	};
	
	var outputSuite = function(suite, config) {
		if ( config.errorsOnly && ! suite.SUITESTATS.length &&
			! suite.TOTALERROR && ! suite.TOTALFAIL ) {
			return;
		}
	
		if ( suite.SPECSTATS.length ) {
			var table = new Table({
				head: ['Test Name', 'Time', 'Status', 'Message'],
				style: {
					head: [ "blue" ]
				}
			});

			suite.SPECSTATS.forEach(function(spec){
				outputSpec(spec, table, config);
			});

			console.log("SUITE: " + chalk.cyan(suite.NAME + ":"));
			console.log(table.toString());
			console.log();
		}
		
		suite.SUITESTATS.forEach(function(nestedSuite) {
			outputSuite(nestedSuite, config);
		});
		
	};
	
	var outputBundle = function(bundle, config) {
	
		if ( config.errorsOnly && ! bundle.TOTALFAIL && ! bundle.TOTALERROR ) {
			return;
		};
		
		console.log(chalk.magenta("BUNDLE: " + bundle.NAME + ":"));
		
		bundle.SUITESTATS.forEach(function(suite) {
			outputSuite(suite, config);
		});

	};

	var outputSummary = function(results, config) {
		var stats = results.bundleStats.reduce(function(stats, bundle) {
			if (bundle.TOTALERROR > 0) { stats[2].amount++; }
			else if (bundle.TOTALFAIL > 0) { stats[1].amount++; }
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