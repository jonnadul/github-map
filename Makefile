all: depend run

depend:
	npm install github
	npm install d3
	npm install express
	npm install morgan
	npm install method-override
	npm install promise

run:
	node server.js

clean:
	npm uninstall github
	npm uninstall d3
	npm uninstall express
	npm uninstall morgan
	npm uninstall method-override
	npm uninstall promise
	rm -rf node_modules
