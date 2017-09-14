var gmach = angular.module('gmach', ['ui.bootstrap']);

gmach.config(function ($sceDelegateProvider) {

	var googleKey = "AIzaSyDgpJz6b1xaU44czAqQ7oQ5eIjZNAJ6k0k";
	var googleEmmedKey = "AIzaSyB4MnIeH5f36G0fiRMZPen3yHOaaHBziUU";

	$sceDelegateProvider.resourceUrlWhitelist([
		// Allow same origin resource loads.
		'self',
		// Allow loading from our assets domain.  Notice the difference between * and **.
		' https://www.google.com/**']);
})

gmach.controller("gSearch", ['$scope', 'gFactory', function ($scope, gFactory) {
	$scope.searchResult = [];
	$scope.haveResult = false;

	$scope.category = "קטגוריה";
	$scope.loading = false;

	$scope.selectCat = function (item) {
		$scope.category = item.title;
	}


	//GET USER GEO-LOCATION
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var lat = position.coords.latitude;
			var lng = position.coords.longitude;
			gFactory.getFormatedAdressFromLocactio(lat, lng).then(function (results) {
				$scope.searchBar = results.data.results[0].formatted_address;
			});
		}, function (err) {
			console.log(err);
		});
	}

	//GET ALL LOCATIONS FROM DB
	// gFactory.getAllLocations().then(function (data) {
	// 	var parseData = JSON.parse(data.data);
	// 	$scope.searchResult.push(...parseData.operations);

	// 	$scope.$broadcast('searchResultHere', $scope.searchResult);

	// }, function (err) {
	// 	console.log(err);
	// });

	function search() {
		$scope.loading = true;
		gFactory.getLocationFromGoolge($scope.searchBar).then(function (data) {
			var results = data.data.results;
			const lat = results[0].geometry.location.lat;
			const lng = results[0].geometry.location.lng;
			const formatted_address = results[0].formatted_address;

			gFactory.getClosestLocation(lat, lng).then(function (data) {
				$scope.searchResult = data.data.ads;

				$scope.loading = false;
				$scope.haveResult = !!$scope.searchResult.length;

				var results = {
					result: $scope.searchResult,
					location: {
						lat: lat,
						lng: lng,
						formatted_address: formatted_address
					}
				}

				$scope.$broadcast('searchResultHere', results);
			}, function (err) {
				console.log(err);
			});

		},
			function (err) {
				console.log(err);
			});
	}

	$scope.search = search;

	$scope.categories = [{ icon: "home", title: "אירוח" }, { icon: "tag", title: "בגדים" }, { icon: "user", title: "חברה וקהילה" }, { icon: "calendar", title: "חגים ומעגל השנה" }, { icon: "cloud", title: "חפצי קדושה" }, { icon: "heart", title: "חתונה" }, { icon: "usd", title: "כספים והלוואות" }, { icon: "apple", title: "מזון" }, { icon: "flash", title: "מכשירי חשמל ביתיים" }, { icon: "baby-formula", title: "נשים ויולדות" }, { icon: "wrench", title: "סיוע מקצועי" }, { icon: "grain", title: "סיוע רפואי" }, { icon: "paperclip", title: "ציוד משרדי" }, { icon: "lamp", title: "רהיטים ביתיים" }, { icon: "cloud", title: "תחבורה והובלה" }, { icon: "knight", title: "ילדים ונוער" }, { icon: "hourglass", title: "תעסוקה" }, { icon: "piggy-bank", title: "אחר" }];

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

gmach.directive('myMap', function () {
	// directive link function
	var link = function (scope, element, attrs) {
		var map, infoWindow;
		var markers = [];

		// scope.searchResult = attrs.myMap;
		scope.$watch(attrs.result, function (newTime) {
			console.log('WATCH1');
		}, true);


		// map config
		var mapOptions = {
			zoom: 16,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		// init the map
		function initMap() {
			if (map === void 0) {
				map = new google.maps.Map(element[0], mapOptions);
			}
		}

		// place a marker
		function setMarker(map, position, title, content) {
			var marker;
			var markerOptions = {
				position: position,
				map: map,
				title: title,
				animation: google.maps.Animation.DROP,
				icon: title == "מיקומך" ? 'http://maps.google.com/mapfiles/ms/micons/red-dot.png' : 'http://maps.google.com/mapfiles/ms/micons/blue-pushpin.png'
			};

			marker = new google.maps.Marker(markerOptions);
			markers.push(marker); // add marker to array

			google.maps.event.addListener(marker, 'click', function () {
				// close window if not undefined
				if (infoWindow !== void 0) {
					infoWindow.close();
				}
				// create new window
				var infoWindowOptions = {
					content: content
				};
				infoWindow = new google.maps.InfoWindow(infoWindowOptions);
				infoWindow.open(map, marker);
			});


		}




		scope.$on('searchResultHere', function (event, data) {
			//create empty LatLngBounds object
			var bounds = new google.maps.LatLngBounds();


			mapOptions.center = new google.maps.LatLng(data.location.lat, data.location.lng);

			// show the map and place some markers
			initMap();

			function clearOverlays() {
				for (var i = 0; i < markers.length; i++ ) {
					markersArray[i].setMap(null);
				}
				markersArray.length = 0;
			}


			setMarker(map, new google.maps.LatLng(data.location.lat, data.location.lng), "מיקומך", "אתה נמצא פה");

			data.result.forEach(function (element) {
				setMarker(map, new google.maps.LatLng(element.lat, element.lng), element.name, element.more);
			}, this);

		});

	};

	return {
		restrict: 'A',
		template: '<div id="gmaps"></div>',
		replace: true,
		scope: { result: '=' },
		link: link,
		controller: function ($scope, $element, $attrs) {

		}
	};
});


gmach.controller('MyModalController', MyModalController)
	.directive('modalTrigger', modalTriggerDirective)
	.factory('$myModal', myModalFactory);

function MyModalController($uibModalInstance, items) {
	var vm = this;
	vm.content = items;
	vm.confirm = $uibModalInstance.close;
	vm.cancel = $uibModalInstance.dismiss;
};

function modalTriggerDirective($myModal) {
	function postLink(scope, iElement, iAttrs) {
		function onClick() {
			var size = scope.$eval(iAttrs.size) || 'lg'; // default to large size
			var element = scope.$eval(iAttrs.element);
			$myModal.open(size, element);
		}
		iElement.on('click', onClick);
		scope.$on('$destroy', function () {
			iElement.off('click', onClick);
		});
	}

	return {
		link: postLink
	};
}

function myModalFactory($uibModal) {
	var open = function (size, element) {
		return $uibModal.open({
			controller: 'MyModalController',
			controllerAs: 'vm',
			//templateUrl: './templates/CustomModal.html',
			template : `<div class="modal-header">
			<h2 class="modal-title">{{vm.content.element.name}}</h2>
		</div>
		<div class="modal-body row">
			<div class="col-sm-6">
				<h3>מידע נוסף על הגמ"ח</h3>
				<h4>{{vm.content.element.more}}</h4>
			</div>
		
			<div class="col-sm-6">
		
				<h3>כתובת</h3>
				<h4>{{vm.content.element.city}} - {{vm.content.element.adress}}</h4>
		
				<h3>איש קשר</h3>
				<h4>{{vm.content.element.contactN}} - {{vm.content.element.contactP}}</h4>
		
				<h3>מייל</h3>
				<h4>{{vm.content.element.contactE}}</h4>
			</div>
		
		
		</div>
		<div class="modal-footer">
			<button class="btn btn-primary" type="button" ng-click="vm.confirm()">
			  אישור
			</button>
		</div>`,
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
};