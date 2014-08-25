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

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(methodOverride());

app.listen(8080);
console.log("App listening on port 8080");

/* Routing API */
app.post('/api/githubmap/:gh_user', function(req, res) {
	//fs.unlink('public/test.json', function(err) {
	//	if(err) console.log('File probably doesnt exist');
	//});

	console.log("Got github username " + req.params.gh_user + " from angular");
	getFromUser(req.params.gh_user).then( function(data) {
		console.log("Caught fulfillagain!");
		
		res.send(string);
	});

/*	
	fs.watchFile('public/test.json', function(curr, prev) {
		console.log('the current mtime is: ' + curr.mtime);
		console.log('the previous mtime was: ' + prev.mtime);
		res.json(string);
	});
*/
});

/*
app.get('/api/githubmap', function(req, res) {
	fs.watchFile('public/test.json', function(curr, prev) {
		console.log('the current mtime is: ' + curr.mtime);
		console.log('the previous mtime was: ' + prev.mtime);
		res.json(string);
	});
});
*/

/* Github Backend */
var num_repos = 0;
var watch_count = 0;
var done = 0;

var string = '';

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
				var watchers_login = JSON.parse(JSON.stringify(watchers.pop().login));
				string = string.concat('{"name": "' +
					watchers_login + '", "size": 3000}');
			
				if (watchers.length > 0) {
					string = string.concat(',');
				}
				/*
				else {
					string = string.concat("\n");
				}
				*/
			

			}

			string = string.concat(']}');
		
			watch_count++;

			console.log("num_repos = " + num_repos +
				" watch_count = " + watch_count);

			if (watch_count == num_repos) {
				console.log("fulfilling!");
				fulfill(res);
			} else if (watch_count > num_repos) {
				reject(err);	
			} else {
				string = string.concat(',');
			}
		});
	});
}

function getFromUser(user_name) {
	// Reset watch count
	watch_count = 0;
	string = '';
	done = 0;

	string = string.concat('{"name": "' +
			user_name + '","children": [');

	return new Promise( function(fulfill, reject) {
		github.repos.getFromUser({
			user: user_name
		}, function(err, res) {
			console.log("Got user responses!");
			var repos = JSON.parse(JSON.stringify(res));
			num_repos = repos.length;

			while (repos.length > 0) {
				var repo_name = JSON.parse(JSON.stringify(repos.pop().name));
				getWatchers(user_name, repo_name).done( function(res) {
					console.log("Caught fulfill\n");
					string = string.concat(']}');
					
					fulfill(res);
				}, reject);
			}
			
		});
	});
}

function finalizer(res) {
	string = string.concat("]}\n");
	done = 1;

	res.json(string);

	/*
	fs.writeFile("public/test.json", string, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
	*/
}

