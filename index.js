#!/usr/bin/env node

(function(){
	
	"use strict";
	
	var rc = require("rc");
	var chalk = require("chalk");
	var validator = require("validator");

	var runner = require("./lib/runner.js");
	var reporter = require("./lib/reporter.js");

	var config = rc("testbox-runner", {});
	
	// validate the configuration
	
	var errors = [];
	
	config.recurse = validator.toBoolean(config.recurse);
	
	if (!validator.isURL(config.runner, {
		require_tld: false,
		require_protocol: true
	})) {
		errors.push("--runner is required and must be a URL");
	}
	
	if (!validator.isLength(config.directory, 1) && !validator.isLength(config.bundles, 1)) {
		errors.push("--directory or --bundles must be provided");
	}
	
	if (errors.length) {
		console.error("There was a problem with your configuration settings.  Check your .testbox-runnerrc file or pass the proper command line arguments".red);
		errors.forEach(function(err){
			console.error(chalk.red(err));
		});
		return;
	}
	
	// option to force chalk
	if (config.chalk) {
		chalk.enabled = true;
	}

	runner(config, function(uri){
		
		console.log("Running tests via URL:", uri);
		console.log();
		
	}, function(error, results){
		
		if (error) {
			console.error(error);
			process.exitCode = 1
			return;
		}

		reporter(results, config);
		process.exitCode = (results.totalFail > 0 || results.totalError > 0) ? 1 : 0;
	});

})();
