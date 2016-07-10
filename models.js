(function () {
    "use strict";

    angular
        .module('app.models', [])
        .service('OpenData', OpenData);

    OpenData.$inject = ['$http', '$q'];

    function OpenData($http, $q) {
        var apiKey = 'bac9d3d9f2742a7aa63d94b640f37ef5';  // Ain't that secure
        var endpoint = 'https://api.uwaterloo.ca/v2/';

        // Caches
        var buildings = [];
        var currentTerm = null;


        // Give a resource name like "buildings/list" and return the request url
        var buildUrl = _.memoize(function (resource) {
            return "#{endpoint}#{resource}.json?key=#{apiKey}";
        });

        // Extract just the 'data' key from the API response.
        var metaRemoved = function (resource) {
            var deferred = $q.defer();

            $http.get(buildUrl(resource)).then(function (resp) {
                deferred.resolve(resp.data.data);
            });

            return deferred.promise;
        };


        // Get buildings closest to the given lat lng pair.
        // Always returns a list.
        // Default coords belong to MC.
        var getBuildings = _.memoize(function (lat, lng) {
            lat = lat || 43.47207511;
            lng = lng || -80.54394739;

            console.debug("Getting buildings near #{lat}, #{lng} ...");
            var deferred = $q.defer();

            metaRemoved('buildings/list')
                .then(function (buildings) {
                    var output = _.sortBy(buildings, function (building) {
                        return getDistance(
                            [lat, lng],
                            [building.latitude, building.longitude]
                        );
                    });

                    deferred.resolve(output);
                });

            return deferred.promise;
        });


        // Return distance between two latlng pairs. LatLng pairs are both arrays.
        // Do not memoize.
        var getDistance = function (latLng1, latLng2) {
            var lat1 = latLng1[0],
                lon1 = latLng1[1],
                lat2 = latLng2[0],
                lon2 = latLng2[1];

            lat1 = parseFloat(lat1);
            lat2 = parseFloat(lat2);
            lon1 = parseFloat(lon1);
            lon2 = parseFloat(lon2);

            R = 6371000;  // Earth metres
            if (!_.all(lat1, lat2, lon1, lon2)) {
                // Max penalty for not being able to calculate it
                console.debug("Skipping calc");
                return R;
            }

            // Simple pythagorean distance
            var dLat = Math.abs(lat1 - lat2);
            var dLng = Math.abs(lon1 - lon2);

            return Math.sqrt(Math.pow(dLat, 2) + Math.pow(dLng, 2));
        };


        var getTerms = function () {
            return metaRemoved('terms/list');
        };


        // Fetches and caches the current term id.
        var getCurrentTerm = _.memoize(function () {
            var deferred = $q.defer();

            if (currentTerm) {
                deferred.resolve(currentTerm);
            } else {
                getTerms().then(function (data) {
                    var currentTerm = data.current_term;
                    deferred.resolve(currentTerm);
                });
            }

            return deferred.promise;
        });


        // Get the list of {subject, description, unit} subjects
        var getSubjects = function () {
            return metaRemoved('codes/subjects');
        };

        // Get the list of classes for this subject happening this term
        var getSubjectSchedule = function (subject) {
            var deferred = $q.defer();

            getCurrentTerm().then(function (term) {
                metaRemoved("terms/#{term}/#{subject}/schedule").then(function (data) {
                    deferred.resolve(data);
                });
            });

            return deferred.promise;
        };


        // For that subject, return a list of its courses at a specific building.
        // Do not memoize.
        var getCoursesAtBuilding = function (subject, buildingCode) {
            console.debug("Finding courses at #{buildingCode}.");
            var deferred = $q.defer();

            var courses = [];

            getSubjectSchedule(subject).then(function (courses_) {
                // for course in courses_
                _.each(courses_, function (course) {
                    var classes_ = course.classes;
                    if (!(classes_ && classes_.length)) {  // No classes
                        return;
                    }

                    _.each(classes_, function (class_) {
                        if (!(class_ && class_.location &&
                              class_.location.building)) {
                            return;
                        }
                        if (class_.location.building == buildingCode) {
                            courses.push(course);
                        }
                    });
                });

                uniqueCourses = _.uniq(courses, false);
                deferred.resolve(uniqueCourses);

                return deferred.promise;
            });
        };


        return {
            getBuildings: getBuildings,
            getCoursesAtBuilding: getCoursesAtBuilding,
            getSubjects: getSubjects,
            getSubjectSchedule: getSubjectSchedule
        };

    }

}());

