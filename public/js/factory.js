gmach.factory("gFactory", ['$http', '$q', function ($http, $q) {
    let serverPath = "https://mychag.herokuapp.com/api/1.0";

    function getLocationFromGoolge(search) {
        return $http.get("http://maps.google.com/maps/api/geocode/json?address=" + search);
    }

    function getClosestLocation(lat, lng) {
        return $http.get(`${serverPath}/ads/closestAd?location=${lat},${lng}`);
    }

    function getLocationByID(id) {
        return $http.get("http://wschool.co.il.networkprotected.com/api/gmc/GetGmc/" + id);
    }

    function getFormatedAdressFromLocactio(lat, lng) {
        return $http.get("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng);
    }

    function getAllLocations() {
        return $http.get("http://wschool.co.il.networkprotected.com/api/gmc/GetGmc");
    }



    return {
        getLocationFromGoolge: getLocationFromGoolge,
        getClosestLocation: getClosestLocation,
        getFormatedAdressFromLocactio: getFormatedAdressFromLocactio,
        getLocationByID: getLocationByID,
        getAllLocations: getAllLocations
    }



    // function showLocation(position) {
    //     var latitude = position.coords.latitude;
    //     var longitude = position.coords.longitude;
    //     alert("Latitude : " + latitude + " Longitude: " + longitude);
    // }
    // function errorHandler(err) {
    //     if (err.code == 1) {
    //         alert("Error: Access is denied!");
    //     } else if (err.code == 2) {
    //         alert("Error: Position is unavailable!");
    //     }
    // }
    // function getUserLocation() {
    //     var defer = $q.defer();
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(function (position) {

    //         }, errorHandler);
    //     } else {
    //         alert("Sorry, browser does not support geolocation!");
    //     }
    // }

}]);