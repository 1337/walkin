/*global _*/
(function () {
    "use strict";
    angular
        .module('app.directives', [])
        .directive('appNav', appNav);


    function appNav() {
        return {
            restrict: 'E',
            templateUrl: 'partials/menu.html',
            controller: function ($scope, $timeout, $mdSidenav, $state) {
                $scope.closeSideNav = function () {
                    $mdSidenav('left').close();
                };
                $scope.openSideNav = function () {
                    $mdSidenav('left').open();
                };
                $scope.goHome = function () {

                };
            }
        };
    }
}());
