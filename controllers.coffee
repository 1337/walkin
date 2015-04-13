app = angular.module('walkin.controllers', ['geolocation'])

app.controller 'MainCtrl', ['$scope', 'OpenData', 'geolocation', ($scope, OpenData, geolocation) ->

    map = L.map('map')

    $scope.buildingCode = 'Loading'
    $scope.buildings = []
    $scope.courses = []
    $scope.subject = 'CHEM'
    $scope.subjects = []


    initMap = ->
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OSM, OpenData'
        }).addTo(map)


    centerMap = (lat, lng) ->
        map?.setView([lat, lng], 18)


    pinBuildings = (buildings) ->
        unless buildings?.length
            return

        angular.forEach buildings, (building) ->
            unless building.latitude and building.longitude
                return
            marker = L.marker([building.latitude, building.longitude])
            marker.addTo(map)
            #marker.bindPopup("#{building.building_code} (#{building.building_name})")

            marker.on 'click', (e) ->
                OpenData.getBuildings(e.latlng.lat, e.latlng.lng).then (buildings) ->
                    building = buildings[0]
                    showCourseList(building.building_code)


    changeSubject = (subject) ->
        $scope.subject = subject
        showCourseList(buildings[0]?.building_code)


    # Given the building code (string)
    showCourseList = (buildingCode) ->
        $scope.buildingCode = buildingCode
        OpenData.getCoursesAtBuilding($scope.subject, buildingCode).then (courses) ->
            $scope.courses = courses


    # Zoom map into where you are
    geolocation.getLocation().then (data) ->
        initMap()

        [lat, lng] = [data.coords.latitude, data.coords.longitude]

        console.debug "User location: ", [lat, lng]

        OpenData.getBuildings(lat, lng).then (buildings) ->
            $scope.buildings = buildings

            # Add buildings to map
            pinBuildings(buildings)

            # Zoom map into the closest building
            centerMap(buildings?[0].latitude, buildings?[0].longitude)

            # Find classes in the closest building
            showCourseList(buildings?[0].building_code)
]
