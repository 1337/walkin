app = angular.module('walkin.models', [])

app.service 'OpenData', ($http, $q) ->
    apiKey = 'bac9d3d9f2742a7aa63d94b640f37ef5'
    endpoint = 'https://api.uwaterloo.ca/v2/'

    return {
        getBuildings: ->
            $http.get("#{endpoint}buildings/list.json?key=#{apiKey}")
    }
