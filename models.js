// Generated by CoffeeScript 1.8.0
(function() {
  var app;

  app = angular.module('walkin.models', []);

  app.service('OpenData', function($http, $q) {
    var apiKey, endpoint;
    apiKey = 'bac9d3d9f2742a7aa63d94b640f37ef5';
    endpoint = 'https://api.uwaterloo.ca/v2/';
    return {
      getBuildings: function() {
        return $http.get("" + endpoint + "buildings/list.json?key=" + apiKey);
      }
    };
  });

}).call(this);