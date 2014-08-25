var express = require('express');
var app = express();
var morgan = require('morgan');
var methodOverride = require('method-override');
var GitHubApi = require('github');
var fs = require('fs');
var Promise = require('promise');

/* Configuration */
var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com",
    timeout: 5000
});

/* Including your github credentials makes
 * the api queries faster
github.authenticate({
	    type: "basic",
	    username: <USERNAME>,
	    password: <PASSWORD>
});
*/

/* Spins up the web app server */
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(methodOverride());

app.listen(8080);
console.log("App listening on port 8080");

/* Routing API */
app.post('/api/githubmap/:gh_user', function(req, res) {

	/* Calls the function call to gather and send
	 * the github map in JSON format */
	getFromUser(req.params.gh_user).then( function(data) {
		res.send(string);
	});
});

/* Github Backend */
/* Global vars */
var num_repos = 0; /* number of repos */
var watch_count = 0; /* number of watchers */
var string = ''; /* initially empty JSON resultant */

/**
 * @name getWatchers
 *
 * @desc
 * 	This function takes a given repo name and
 * 	gets all the watchers of the repo and fills
 * 	the global string variable accordingly.
 *
 * @param user_name
 * 	github user name
 *
 * @param repo_name
 * 	github user's repository name
 */
function getWatchers(user_name, repo_name) {
	return new Promise( function(fulfill, reject) {
		github.repos.getWatchers({
			user: user_name,
			repo: repo_name
		}, function(err, res) {
			var watchers = JSON.parse(JSON.stringify(res));

			string = string.concat('{"name": "' +
				repo_name + '","children": [');

			while (watchers.length > 0) {
				var watchers_login = JSON.parse(
					JSON.stringify(watchers.pop().login));
				
				string = string.concat('{"name": "' +
					watchers_login + '", "size": 3000}');
			
				if (watchers.length > 0) {
					string = string.concat(',');
				}
			}

			string = string.concat(']}');
		
			/* Hacky approach */
			/* Uses the watchers count against the
			 * number of repos present to determine
			 * when to no longer expect anymore responses
			 * from this api call, if the watchers count
			 * exceeds the number of repos something went
			 * wrong. */
			watch_count++;

			if (watch_count == num_repos) {
				fulfill(res);
			} else if (watch_count > num_repos) {
				reject(err);	
			} else {
				string = string.concat(',');
			}
		});
	});
}

/**
 * @name getFromUser
 *
 * @desc
 * 	This function takes a github username and
 * 	determines all of his repos, then calls
 * 	getWatchers().
 *
 * @param user_name
 * 	Github username
 */
function getFromUser(user_name) {
	/* Reset the watch count
	 * and JSON result
	 */
	watch_count = 0;
	string = '';

	string = string.concat('{"name": "' +
			user_name + '","children": [');

	return new Promise( function(fulfill, reject) {
		github.repos.getFromUser({
			user: user_name
		}, function(err, res) {
			var repos = JSON.parse(JSON.stringify(res));
			num_repos = repos.length;

			while (repos.length > 0) {
				var repo_name = JSON.parse(
					JSON.stringify(repos.pop().name));
				
				getWatchers(user_name, repo_name).done( function(res) {
					string = string.concat(']}');
					
					fulfill(res);
				}, reject);
			}
			
		});
	});
}
