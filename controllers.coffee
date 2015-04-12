app = angular.module('walkin.controllers', ['geolocation'])

app.controller 'MainCtrl', [$scope OpenData geolocation ($scope, OpenData, geolocation) ->

    $scope.buildings = []

    OpenData.getBuildings().then (resp) ->
        $scope.buildings = resp.data.data

        map = L.map('map')
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OSM'
        }).addTo(map)

        angular.forEach $scope.buildings, (building) ->
            unless building.latitude and building.longitude
                return
            map.setView([building.latitude, building.longitude], 18)
            L
                .marker([building.latitude, building.longitude])
                .addTo(map)
                .bindPopup("#{building.building_code} (#{building.building_name})")

]