// Generated by CoffeeScript 1.8.0
(function() {
  var app;

  app = angular.module('walkin.controllers', ['geolocation']);

  app.controller('MainCtrl', [
    '$scope', 'OpenData', 'geolocation', function($scope, OpenData, geolocation) {
      var centerMap, initMap, map, pinBuildings, showCourseList;
      map = L.map('map');
      $scope.buildingCode = 'Loading';
      $scope.buildings = [];
      $scope.courses = [];
      $scope.subject = 'MATH';
      initMap = function() {
        return L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OSM, OpenData'
        }).addTo(map);
      };
      centerMap = function(lat, lng) {
        return map != null ? map.setView([lat, lng], 18) : void 0;
      };
      pinBuildings = function(buildings) {
        if (!(buildings != null ? buildings.length : void 0)) {
          return;
        }
        return angular.forEach(buildings, function(building) {
          var marker;
          if (!(building.latitude && building.longitude)) {
            return;
          }
          marker = L.marker([building.latitude, building.longitude]);
          marker.addTo(map);
          return marker.on('click', function(e) {
            return OpenData.getBuildings(e.latlng.lat, e.latlng.lng).then(function(buildings) {
              building = buildings[0];
              return showCourseList(building.building_code);
            });
          });
        });
      };
      showCourseList = function(buildingCode) {
        $scope.buildingCode = buildingCode;
        return OpenData.getCoursesAtBuilding($scope.subject, buildingCode).then(function(courses) {
          return $scope.courses = courses;
        });
      };
      return geolocation.getLocation().then(function(data) {
        var lat, lng, _ref;
        initMap();
        _ref = [data.coords.latitude, data.coords.longitude], lat = _ref[0], lng = _ref[1];
        console.debug("User location: ", [lat, lng]);
        return OpenData.getBuildings(lat, lng).then(function(buildings) {
          $scope.buildings = buildings;
          pinBuildings(buildings);
          centerMap(buildings != null ? buildings[0].latitude : void 0, buildings != null ? buildings[0].longitude : void 0);
          return showCourseList(buildings != null ? buildings[0].building_code : void 0);
        });
      });
    }
  ]);

}).call(this);
