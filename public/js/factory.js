gmach.factory("gFactory", ['$http', '$q', function ($http, $q) {
    let apiPath = "https://mychag.herokuapp.com/api/1.0/";

    function getLocationFromGoolge(search) {
        return $http.get("http://maps.google.com/maps/api/geocode/json?address=" + search );
    }

    function getClosestLocation(lat, lng) {
        return $http.get(`${apiPath}ads/closestAd?location=${lat},${lng}&range=5`);
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
    };


}]).factory('$myModal', myModalFactory);

function myModalFactory($uibModal) {
	var open = function (size, element) {
		return $uibModal.open({
			controller: 'MyModalController',
			controllerAs: 'vm',
			templateUrl: './templates/CustomModal.html',
			size: size,
			resolve: {
				items: function () {
					return {
						element: element
					};
				}
			}
		});
	};

	return {
		open: open
	};
}