// public/core.js
var ghmapApp = angular.module('ghmapApp', ['d3']);

ghmapApp.controller('mainController', function ($scope, $http) {
	$scope.gh_user = '';
	$scope.data = '';

	$scope.setUser = function() {
		console.log('Attempting setUser');
		$http.post('/api/githubmap/' + $scope.gh_user)
			.success(function(data) {
				$scope.data = data
			})
			.error(function(data) {
				console.log('Error setUser: ' +
					data);
			});
	}
});

ghmapApp.directive('d3Bars', ['$window', '$timeout', 'd3Service',
	function($window, $timeout, d3Service) {
		return {
      			restrict: 'A',
      			scope: {
        		data: '=',
        		label: '@',
        		onClick: '&'
      		},
	link: function(scope, ele, attrs) {
		d3Service.d3().then(function(d3) {
 
          	var renderTimeout;
          	var margin = parseInt(attrs.margin) || 20;
		
		var diameter = 960;

		var tree = d3.layout.tree()
    			.size([360, diameter / 2 - 120])
			.separation(function(a, b) {
				return (a.parent == b.parent ? 1 : 2) / a.depth; });

		var diagonal = d3.svg.diagonal.radial()
    			.projection(function(d) {
				return [d.y, d.x / 180 * Math.PI]; });
 
		var svg = d3.select("body")
			.append("svg")
    			.attr("width", diameter)
    			.attr("height", diameter)
  			.append("g")
			.attr("transform", "translate(" + 
				diameter / 2 + "," + diameter / 2 + ")");
 
          	$window.onresize = function() {
            		scope.$apply();
          	};
 
          	scope.$watch(function() {
            		return angular.element($window)[0].innerWidth;
          	}, function() {
            		scope.render(scope.data);
          	});
 
          	scope.$watch('data', function(newData) {
            		scope.render(newData);
          	}, true);
 
          	scope.render = function(data) {
            		svg.selectAll('*').remove();
 
            		if (!data) return;
			if (renderTimeout) clearTimeout(renderTimeout);
	 
			renderTimeout = $timeout(function() {
  				var nodes = tree.nodes(data),
      					links = tree.links(nodes);

  				var link = svg.selectAll(".link")
      					.data(links)
					.enter().append("path")
					.attr("class", "link")
					.attr("d", diagonal);

				var node = svg.selectAll(".node")
					.data(nodes)
					.enter().append("g")
					.attr("class", "node")
					.attr("transform", function(d) {
						return "rotate(" + (d.x - 90) +
						")translate(" + d.y + ")"; })

				node.append("circle")
					.attr("r", 4.5);

				node.append("text")
					.attr("dy", ".31em")
					.attr("text-anchor", function(d) {
						return d.x < 180 ? "start" : "end";
					})
					.attr("transform", function(d) {
						return d.x < 180 ?
						"translate(8)" :
						"rotate(180)translate(-8)"; })
					.text(function(d) { return d.name; });

				d3.select(self.frameElement).style("height",
					diameter - 150 + "px");
            		}, 200);
          	};
	});
	}}
}]);
