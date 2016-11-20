define(['app'], function(directives) {
    directives.directive('gauge', ['$http','$q','$window', function($http, $q, $window) {
	return {
		scope: {
			option: '=',
			id: '='
		},
		restrict: 'E',
		template:'<div layout = "row" class="green" style="position:absolute;top:0;left:0;right:0;bottom:0;">'+
		 '<div flex="40" class="title">{{option.name}}</div>' +
		 '<div flex layout = "column">'+
		 '<div flex class="gaugeitem" style="text-align:center">'+
		 	'<label class="value">{{option.value}}</label> <label class="unit">{{option.unit}}</label></div>'+
		 '<div flex class="gaugeitem" ng-class="{\'safe\' : option.status === 0, \'warning\' : option.status === 1, \'dangerous\' : option.status === 2}"></div>'+
		 '</div></div>',
		 link:function(scope, http, element, attr){
		}
	}
}]);
});