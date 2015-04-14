app = angular.module('walkin.controllers', ['geolocation'])

app.controller 'MainCtrl', ['$scope', 'OpenData', 'geolocation', ($scope, OpenData, geolocation) ->

    map = L.map('map')

    $scope.building = {}
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
                    $scope.buildings = buildings
                    $scope.changeBuilding($scope.buildings[0])


    $scope.changeBuilding = (building) ->
        $scope.building = building
        showCourseList($scope.building.building_code)


    $scope.changeSubject = (subject) ->
        $scope.subject = subject
        showCourseList($scope.building.building_code)


    # Given the building code (string)
    showCourseList = (buildingCode) ->
        $scope.buildingCode = buildingCode
        OpenData.getCoursesAtBuilding($scope.subject, buildingCode).then (courses) ->
            $scope.courses = courses


    # Start the app.
    # lat and lng are starting coords, defaulting to main campus.
    init = (lat=43.472285, lng=-80.544858) ->
        initMap()

        OpenData.getSubjects().then (subjects) ->
            $scope.subjects = subjects

        OpenData.getBuildings(lat, lng).then (buildings) ->
            $scope.buildings = buildings
            # Find classes in the closest building
            $scope.changeBuilding(buildings[0])

            # Add buildings to map
            pinBuildings(buildings)
            # Zoom map into the closest building
            centerMap(buildings?[0].latitude, buildings?[0].longitude)

    init()
    # Zoom map into where you are
    geolocation.getLocation().then (data) ->
            [lat, lng] = [data.coords.latitude, data.coords.longitude]
            console.debug "User location: ", [lat, lng]
            init(lat, lng)
]
