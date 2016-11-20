define(['require',
        'angular',
        'jquery',
        'bootstrap',
        'angular-route',
        'angular-nvd3',
        "angular-uigrid",
        "angular-timeline",
        "angular-sanitize",
        "angular-material",
       ], function (require, angular) {
	'use strict';
    var mainApp =  angular.module('DMRApp.main', ['nvd3','ngRoute', 'ngMaterial', 'ui.grid', 'ui.grid.resizeColumns',
					 'ui.grid.selection', 'angular-timeline', 'ngSanitize']);
    mainApp.config(['$routeProvider',
						function($routeProvider) {
							$routeProvider.
							when('/home', {
								template: '<div ng-include src="templateUrl" onload="onsliderload()"></div>',
								controller: 'homeCtrl'
							}).
							when('/production', {
								template: '<div ng-include src="templateUrl" onload="onsliderload()"></div>',
								controller: 'productionCtrl'
							}).
							when('/search', {
								template: '<div ng-include src="templateUrl"></div>',
								controller: 'searchCtrl'
							}).
							when('/monitor', {
								template: '<div ng-include src="templateUrl" onload="onsliderload()"></div>',
								controller: 'monitorCtrl'
							}).
							otherwise({
								//templateUrl doesn't work in this case because there is on onload event. but ng-include has and will do binding with the controller.
								template: '<div ng-include src="templateUrl"></div>',
								controller: 'homeCtrl'
							});
						}
					]);

          mainApp.config(function($mdThemingProvider) {
          //   $mdThemingProvider.theme('default')
          // .primaryPalette('blue')
          // .accentPalette('indigo')
          // .warnPalette('red')
          // .backgroundPalette('grey');

    $mdThemingProvider.definePalette('blueGrayPalette', {
        '50': 'ECEFF1',
        '100': 'CFD8DC',
        '200': 'B0BEC5',
        '300': 'B0BEC5',
        '400': '78909C',
        '500': '607D8B',
        '600': '546E7A',
        '700': '455A64',
        '800': '37474F',
        '900': '263238',
        'A100': 'ff8a80',
        'A200': 'ff5252',
        'A400': 'ff1744',
        'A700': 'd50000',
        'contrastDefaultColor': 'light',    // whether, by default, text         (contrast)
                                    // on this palette should be dark or light
        'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
         '200', '300', '400', 'A100'],
        'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });

    $mdThemingProvider.theme('custom')
         .primaryPalette('blueGrayPalette');
         
    $mdThemingProvider.setDefaultTheme('custom');     
    });

   	return mainApp;
 });
