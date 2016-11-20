define(['require',
        'angular',
        'moment',
        'angular-route',
        "app-controllers", "app-services","app-directives"
       ],
       function(require,angular){
            'use strict';
            window.moment = require('moment');
            require(['domReady!'],function(document){
				 var app = angular.module('DMRApp.boot', ['ngRoute', 'DMRApp.main']);
				 angular.bootstrap(document,['DMRApp.boot']);
            });
        });