/*global _*/
(function () {
    "use strict";
    angular
        .module('app', [
            'app.vendor',
            'app.controllers',
            'app.directives',
            'app.models'
        ])
        .run(leakState)
        .config(setupRoutes);




    function leakState($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
    leakState.$inject = ['$rootScope', '$state', '$stateParams'];


    function setupRoutes($stateProvider, $urlRouterProvider) {

        function getTemplateUrl($stateParams) {
            return 'partials/' +
                   _.kebabCase($stateParams.path || 'main') +
                   '.html';
        }

        function getControllerName($stateParams) {
            return _.capitalize(_.camelCase($stateParams.path || 'main')) +
                   'Controller';
        }

        $stateProvider
            .state('/', {
                url: '/',
                templateUrl: 'partials/main.html',
                controllerProvider: 'MainController'
            })
            .state('/settings', {
                url: '/settings',
                templateUrl: 'partials/settings.html',
                controllerProvider: 'SettingsController'
            });

        $urlRouterProvider.otherwise('/');
    }
    setupRoutes.$inject = ['$stateProvider', '$urlRouterProvider'];
}());
