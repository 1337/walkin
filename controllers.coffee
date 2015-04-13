app = angular.module('walkin.controllers', ['geolocation'])

app.controller 'MainCtrl', ['$scope', 'OpenData', 'geolocation', ($scope, OpenData, geolocation) ->

    map = L.map('map')

    $scope.building = {}
    $scope.buildings = []
    $scope.courses = []
    $scope.subject = 'MATH'


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
                    $scope.building = building
                    showCourseList(building.building_code)


    # Given the building code (string)
    showCourseList = (buildingCode) ->
        $scope.buildingCode = buildingCode
        OpenData.getCoursesAtBuilding($scope.subject, buildingCode).then (courses) ->
            $scope.courses = courses


    # Start the app.
    # lat and lng are starting coords, defaulting to main campus.
    init = (lat=43.472285, lng=-80.544858) ->
        initMap()

        OpenData.getBuildings(lat, lng).then (buildings) ->
            $scope.buildings = buildings
            # Add buildings to map
            pinBuildings(buildings)
            # Zoom map into the closest building
            centerMap(buildings?[0].latitude, buildings?[0].longitude)
            # Find classes in the closest building
            showCourseList(buildings?[0].building_code)


    init()
    # Zoom map into where you are
    geolocation.getLocation().then (data) ->
            [lat, lng] = [data.coords.latitude, data.coords.longitude]
            console.debug "User location: ", [lat, lng]
            init(lat, lng)
]