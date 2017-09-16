gmach.directive("newAd", function ($uibModal, eventTypes, gFactory) {
    return {
        restrict: 'E',
        replace: true,
        controller: function ($scope, $element, $attrs) {
            $scope.open = function () {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: './templates/newAdModal.html',
                    size: 'lg',

                    controller: function ($scope) {
                        $scope.categories = eventTypes;
                        $scope.exp = {
                            location: {
                                formatted_address: ''
                            },
                            userInfo: {},
                            date: new Date()
                        };

                        $scope.ok = function () {
                            gFactory.postNewAd(angular.copy($scope.exp)).then(x => console.dir(x), x => console.dir(x));
                        };
                        $scope.getLocation = function () {
                            gFactory.getLocationFromGoolge($scope.exp.location.formatted_address).then(function (data) {
                                var results = data.data.results;
                                const lat = results[0].geometry.location.lat;
                                const lng = results[0].geometry.location.lng;
                                const formatted_address = results[0].formatted_address;

                                $scope.exp.location = {
                                    formatted_address: formatted_address,
                                    lat: lat,
                                    lng: lng
                                };

                            }, function (err) {
                                console.log(err);
                            });

                        }
                    }
                });

                modalInstance;

            };

        }
    };

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
                icon: title == "מיקומך" ? 'https://maps.google.com/mapfiles/ms/micons/red-dot.png' : 'https://maps.google.com/mapfiles/ms/micons/blue-pushpin.png'
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
            mapOptions.center = new google.maps.LatLng(data.userLocation.lat, data.userLocation.lng);

            // show the map and place some markers
            initMap();

            if (markers.length) {
                markers.forEach( marker => marker.setMap(null));
            }
            //set the user marker
            setMarker(map, new google.maps.LatLng(data.userLocation.lat, data.userLocation.lng), "מיקומך", "אתה נמצא פה");
            //trak all markers- to make sure they all displayed on the map
            var bounds = new google.maps.LatLngBounds();

            data.result.forEach(function (element) {
                element.imgFile = element.imgFile || "https://www.oysterdiving.com/components/com_easyblog/themes/wireframe/images/placeholder-image.png";
                setMarker(map, new google.maps.LatLng(element.location.lat, element.location.lng), element.title, element.more);
                bounds.extend({
                    lat: element.location.lat,
                    lng: element.location.lng
                });
            }, this);

            //tell your map to sets the viewport to contain all the places.
            map.fitBounds(bounds);
        });

    };

    return {
        restrict: 'A',
        template: '<div id="gmaps"></div>',
        replace: true,
        scope: {
            result: '='
        },
        link: link,
        controller: function ($scope, $element, $attrs) {

        }
    };
});


gmach.directive('modalTrigger', function ($myModal) {
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
});