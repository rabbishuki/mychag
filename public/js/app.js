var gmach = angular.module('gmach', ['ui.bootstrap']);

gmach.config(function ($sceDelegateProvider) {

	var googleKey = "AIzaSyDgpJz6b1xaU44czAqQ7oQ5eIjZNAJ6k0k";
	var googleEmmedKey = "AIzaSyB4MnIeH5f36G0fiRMZPen3yHOaaHBziUU";

	$sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self',
		// Allow loading from our assets domain.  Notice the difference between * and **.
		' https://www.google.com/**'
	]);
});

gmach.constant('eventTypes', [{
		id: 101,
		icon: "home",
		title: "הנחת תפילין"
	}, {
		id: 102,
		icon: "home",
		title: "בית כנסת"
	}, {
		id: 201,
		icon: "home",
		title: "מניין ראש השנה"
	},
	{
		id: 202,
		icon: "home",
		title: "מניין יום כיפור"
	},
	{
		id: 203,
		icon: "home",
		title: "סוכה"
	},
	{
		id: 204,
		icon: "home",
		title: "נטילת לולב"
	}
]);

gmach.controller("gSearch", ['$scope', 'gFactory', 'eventTypes', function ($scope, gFactory, eventTypes) {
	$scope.searchResult = [];
	$scope.haveResult = false;

	$scope.category = "אני רוצה למצוא";
	$scope.loading = false;

	$scope.selectCat = function (item) {
		$scope.category = item.title;
	};


	//GET USER GEO-LOCATION
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			gFactory.getFormatedAdressFromLocactio(lat, lng).then(function (results) {
				if (results.data.results.length != 0)
					$scope.searchBar = results.data.results[0].formatted_address;
			});
		}, function (err) {
			console.log(err);
		});
	}

	function search() {
		$scope.loading = true;
		gFactory.getLocationFromGoolge($scope.searchBar).then(function (data) {
				if (!data.data.results.length) {
					alert("המערכת לא מצאה את הכתובת אותה הזנת, אנא נסה בשנית");
					$scope.loading = false;
				}
				else{
					var results = data.data.results;
					const lat = results[0].geometry.location.lat;
					const lng = results[0].geometry.location.lng;
					const formatted_address = results[0].formatted_address;

					gFactory.getClosestLocation(lat, lng).then(function (data) {
						$scope.searchResult = data.data;

						$scope.loading = false;
						$scope.haveResult = !!$scope.searchResult.length;

						var results = {
							result: $scope.searchResult,
							userLocation: {
								lat: lat,
								lng: lng,
								formatted_address: formatted_address
							}
						};

						$scope.$broadcast('searchResultHere', results);
					}, function (err) {
						console.log(err);
					});
				}
			},

			function (err) {
				console.log(err);
			});

	}

	$scope.search = search;

	$scope.categories = eventTypes;
}]);

gmach.controller('DropdownCtrl', function ($scope, $log) {
	$scope.items = [
		'The first choice!',
		'And another choice for you.',
		'but wait! A third!'
	];

	$scope.status = {
		isopen: false
	};

	$scope.toggled = function (open) {
		$log.log('Dropdown is now: ', open);
	};

	$scope.toggleDropdown = function ($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.status.isopen = !$scope.status.isopen;
	};

	$scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));
});

gmach.controller('MyModalController', function ($uibModalInstance, items) {
	var vm = this;
	vm.content = items;
	vm.confirm = $uibModalInstance.close;
	vm.cancel = $uibModalInstance.dismiss;
});