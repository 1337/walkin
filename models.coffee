app = angular.module('walkin.models', [])

app.service 'OpenData', ['$http', '$q', ($http, $q) ->
    apiKey = 'bac9d3d9f2742a7aa63d94b640f37ef5'
    endpoint = 'https://api.uwaterloo.ca/v2/'

    # Caches
    buildings = []
    currentTerm = null


    # Give a resource name like "buildings/list" and return the request url
    buildUrl = _.memoize (resource) ->
        "#{endpoint}#{resource}.json?key=#{apiKey}"


    # Extract just the 'data' key from the API response.
    metaRemoved = (resource) ->
        deferred = $q.defer()

        $http.get(buildUrl(resource)).then (resp) ->
            deferred.resolve resp.data.data

        return deferred.promise


    # Get buildings closest to the given lat lng pair.
    # Always returns a list.
    # Default coords belong to MC.
    getBuildings = _.memoize (lat=43.47207511, lng=-80.54394739) ->
        console.debug "Getting buildings near #{lat}, #{lng} ..."
        deferred = $q.defer()

        metaRemoved('buildings/list').then (buildings) ->
            output = _.sortBy buildings, (building) ->
                getDistance([lat, lng], [building.latitude, building.longitude])

            # console.debug "Buildings by distance: ", _.pluck(output, 'building_code')
            deferred.resolve output

        return deferred.promise


    # Return distance between two latlng pairs. LatLng pairs are both arrays.
    # Do not memoize.
    getDistance = (latLng1, latLng2) ->
        [lat1, lon1] = latLng1
        [lat2, lon2] = latLng2

        if typeof lat1 is 'string'
            lat1 = parseFloat(lat1)
        if typeof lat2 is 'string'
            lat2 = parseFloat(lat2)
        if typeof lon1 is 'string'
            lon1 = parseFloat(lon1)
        if typeof lon2 is 'string'
            lon2 = parseFloat(lon2)

        R = 6371000  # Earth metres
        unless _.all(lat1, lat2, lon1, lon2)
            # Max penalty for not being able to calculate it
            console.debug("Skipping calc")
            return R

        # Simple pythagorean distance
        dLat = Math.abs(lat1 - lat2)
        dLng = Math.abs(lon1 - lon2)
        return Math.sqrt(dLat ** 2 + dLng ** 2)


    getTerms = ->
        metaRemoved('terms/list')


    # Fetches and caches the current term id.
    getCurrentTerm = _.memoize ->
        deferred = $q.defer()

        if currentTerm
            deferred.resolve currentTerm
        else
            getTerms().then (data) ->
                currentTerm = data.current_term
                deferred.resolve currentTerm

        return deferred.promise


    # Get the list of {subject, description, unit} subjects
    getSubjects = ->
        metaRemoved('codes/subjects')

    # Get the list of classes for this subject happening this term
    getSubjectSchedule = (subject) ->
        deferred = $q.defer()

        getCurrentTerm().then (term) ->
            metaRemoved("terms/#{term}/#{subject}/schedule").then (data) ->
                deferred.resolve data

        return deferred.promise


    # For that subject, return a list of its courses at a specific building.
    # Do not memoize.
    getCoursesAtBuilding = (subject, buildingCode) ->
        console.debug "Finding courses at #{buildingCode}."
        deferred = $q.defer()

        courses = []

        getSubjectSchedule(subject).then (courses_) ->
            for course in courses_
                classes_ = course.classes
                unless classes_?.length  # No classes
                    continue

                for class_ in classes_
                    if class_?.location?.building == buildingCode
                        courses.push course

            uniqueCourses = _.uniq(courses, false)
            deferred.resolve uniqueCourses

        return deferred.promise


    return {
        getBuildings: getBuildings
        getCoursesAtBuilding: getCoursesAtBuilding
        getSubjects: getSubjects
        getSubjectSchedule: getSubjectSchedule
    }
]
