let apiPath = "https://mychag.herokuapp.com/api/1.0/";
gmach.factory("gFactory", ['$http', '$q', function ($http, $q) {

    function getLocationFromGoolge(search) {
        return $http.get("https://maps.google.com/maps/api/geocode/json?address=" + search );
    }

    function getClosestLocation(lat, lng) {
        return $http.get(`${apiPath}ads/closestAd?location=${lat},${lng}&range=5`);
    }

    function getFormatedAdressFromLocactio(lat, lng) {
        return $http.get("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng);
    }
    

    function postNewAd(obj) {
        return $http.post( `${apiPath}ads`, obj);
    }

    return {
        getLocationFromGoolge: getLocationFromGoolge,
        getClosestLocation: getClosestLocation,
        getFormatedAdressFromLocactio: getFormatedAdressFromLocactio,
        postNewAd:postNewAd
    };
}]).factory('$myModal', function($uibModal) {
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
}).factory('adminFactory', ['$http',function($http){
    function getAllUnaproved(login){
        return $http.post( `${apiPath}ads/unaprovedAds`, login);
    }
    
    function approveAd(id, login){
        return $http.post( `${apiPath}ads/approve/${id}`, login);
    }

    return {
        getAllUnaproved : getAllUnaproved,
        approveAd : approveAd
    }
}]);