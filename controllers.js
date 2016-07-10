(function () {
    'use strict';

    angular
        .module('app.controllers', [])
        .controller('MainController', MainController)
        .controller('SettingsController', SettingsController);

    function MainController($scope, OpenData, geolocation) {
        var map = L.map('map');

        function initMap() {
            return L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                {
                    attribution: '&copy; OSM, OpenData'
                }).addTo(map);
        }
        function centerMap(lat, lng) {
            return map != null ? map.setView([lat,
                                              lng],
                18) : void 0;
        }
        function pinBuildings(buildings) {
            if (!(buildings !=
                  null ? buildings.length : void 0)) {
                return;
            }

            angular.forEach(buildings, function (building) {
                var marker;
                if (!(building.latitude && building.longitude)) {
                    return;
                }
                marker = L.marker([
                    building.latitude,
                    building.longitude
                ]);
                // marker.addTo(map);

                return marker.on('click',
                    function (e) {
                        return OpenData.getBuildings(e.latlng.lat,
                            e.latlng.lng).then(function (buildings) {
                            $scope.buildings =
                                buildings;
                            return $scope.changeBuilding($scope.buildings[0]);
                        });
                    });
            });
        }
        function showCourseList(buildingCode) {
            $scope.buildingCode = buildingCode;
            return OpenData.getCoursesAtBuilding($scope.subject,
                buildingCode).then(function (courses) {
                return $scope.courses = courses;
            });
        }
        function init(lat, lng) {
            if (lat == null) {
                lat = 43.472285;
            }
            if (lng == null) {
                lng = -80.544858;
            }
            initMap();
            OpenData.getSubjects().then(function (subjects) {
                return $scope.subjects = subjects;
            });
            return OpenData.getBuildings(lat,
                lng).then(function (buildings) {
                $scope.buildings = buildings;
                $scope.changeBuilding(buildings[0]);
                pinBuildings(buildings);
                return centerMap(buildings !=
                                 null ? buildings[0].latitude : void 0,
                    buildings !=
                    null ? buildings[0].longitude : void 0);
            });
        }

        $scope.changeBuilding =
            function (building) {
                $scope.building = building;
                return showCourseList($scope.building.building_code);
            };
        $scope.changeSubject = function (subject) {
            $scope.subject = subject;
            return showCourseList($scope.building.building_code);
        };
        $scope.building = {};
        $scope.buildings = [];
        $scope.courses = [];
        $scope.subject = 'CHEM';
        $scope.subjects = [];

        init();

        geolocation.getLocation().then(function (data) {
            var lat, lng, _ref;
            _ref = [data.coords.latitude,
                    data.coords.longitude], lat =
                _ref[0], lng = _ref[1];
            console.debug("User location: ", [lat, lng]);
            var marker = L.marker([lat, lng]);
            marker.addTo(map);

            init(lat, lng);
        });
    }
    MainController.$inject = ['$scope', 'OpenData', 'geolocation'];

    function SettingsController() {

    }
}());
