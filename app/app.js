
/**
 * Created by Jiraindira on 12/15/14.
 */
if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

angular.module('formApp', [
    'ngAnimate',
    'ngResource',
    'ui.router',
    'firebase',
    'myService',
    'myFilters',
    'ui.bootstrap'
])

// configuring our routes 
// =============================================================================
    .config(function($stateProvider, $urlRouterProvider) {

        $stateProvider
            .state('app',{
                url: '/',
                views: {
                    'header': {
                        templateUrl: 'partials/header.html'
                    },
                    'content': {
                        templateUrl: 'partials/content.html'
                    }
                }
            })

            .state('app.home', {
                url: 'home',
                views: {
                    'content@': {
                        templateUrl: 'partials/home.html',
                        controller: 'homeController'
                    }
                }

            })

            .state('app.feedback', {
                url: 'feedback',
                views: {
                    'content@': {
                        templateUrl: 'partials/feedback.html',
                        controller: 'feedbackController'
                    }
                }

            })

            .state('app.addReview', {
                url: 'addReview',
                views: {
                    'content@': {
                        templateUrl: 'partials/addReview.html',
                        controller: 'formController'
                    }
                }

            })

            .state('app.addReview.basic', {
                url: '/basic',

                views: {

                    'form@app.addReview': {
                        templateUrl: 'partials/addReview-basic.html'
                        //controller: 'formController'
                    }
                }

            })

            .state('app.addReview.required', {
                url: '/required',
                /*
                 templateUrl: 'templates/partials/subscriber-detail.html',
                 controller: 'SubscriberDetailController'
                 */

                views: {
                    'form@app.addReview': {
                        templateUrl: 'partials/addReview-required.html'
                        //controller: 'formController'
                    }
                }

            })

            .state('app.addReview.optional', {
                url: '/optional',
                /*
                 templateUrl: 'templates/partials/subscriber-detail.html',
                 controller: 'SubscriberDetailController'
                 */

                views: {
                    'form@app.addReview': {
                        templateUrl: 'partials/addReview-optional.html'
                        //controller: 'formController'
                    }
                }

            });

        // catch all route
        // send users to the form page
        $urlRouterProvider.otherwise('/');
    })

// our controller for the form
// =============================================================================
    .controller('formController', ['$scope', 'placesExplorerService', '$state', '$filter', '$firebase', '$http','$modal', function($scope,placesExplorerService, $state,$filter, $firebase,$http,$modal) {

        // we will store all of our form data in this object
        $http.get('data/bmatrixParameters.json').success(function(data) {
            $scope.parameters = data;
        });

        // we will store all of the restaurant specific data here
        $scope.restaurantData = {};
        // we will store all of the reviewer's specific data here
        $scope.reviewerData = {};

        $scope.restaurantData = {
            observations: {
                'Big Group': false,
                'Casual':false,
                'Conversation': false,
                'Crowded':false,
                'Date': false,
                'Fine Dining':false,
                'Great Service': false,
                'Great View': false,
                'Long Wait':false,
                'Meeting': false,
                'Mixology': false,
                'Romantic':false
            },
            'location' : 'New York, NY'
        };

        $scope.reviewerData = {
            'cost': '$'
        };

        $scope.AddPost = function(){
            var id = $scope.restaurantData.fsquareID;
            var manualId = $scope.restaurantData.name;
            var reviewer = $scope.reviewerData.reviewer;

            if (id == undefined){
                var firebaseID = manualId;
                var firebaseChild = "name";
            }
            else{
                var firebaseID = id;
                var firebaseChild = "fsquareID"
            }
            //add date to the reviewer list
            d = new Date();
            $scope.reviewerData.date = d;

            // Making a copy so that you don't mess with original user input
            var payloadRestaurant = angular.copy($scope.restaurantData);
            var payloadReviewer = angular.copy($scope.reviewerData);

            // create restaurant object from firebase
            var restoRef = new Firebase('https://dazzling-heat-4525.firebaseio.com/restaurant');
            var reviewsUrl = "";
            var fbReviews = {};

            restoRef.orderByChild(firebaseChild).startAt(firebaseID).endAt(firebaseID).once('value', function(dataSnapshot) {
                //GET DATA

                if (dataSnapshot.exists()){
                    var data = dataSnapshot.val();
                    var key = Object.keys(data)[0];
                    var masterList = consolidateObservation(data[key],payloadRestaurant);
                    restoRef.child(key).set(masterList);
                    reviewsUrl = 'https://dazzling-heat-4525.firebaseio.com/restaurant/' + key + "/reviews";
                    fbReviews = new Firebase(reviewsUrl);
                    fbReviews.push(payloadReviewer);
                    $state.go('app.home', {}, {reload: true});
                }
                else{
                    var pushedResto = restoRef.push(payloadRestaurant);
                    reviewsUrl = 'https://dazzling-heat-4525.firebaseio.com/restaurant/' + pushedResto.key() + "/reviews";
                    fbReviews = new Firebase(reviewsUrl);
                    fbReviews.push(payloadReviewer);
                    $state.go('app.home', {}, {reload: true});
                }
            });

        };

        //consolidate observations into a master list
        function consolidateObservation(masterObservation,userObservation){
            for (var key in userObservation.observations){
                var temp = userObservation.observations[key];
                if (temp == true) {
                    masterObservation.observations[key] = userObservation.observations[key];
                }
            }
            return masterObservation;

        }

        //find location from four square
        $scope.doSearch = function () {
            $scope.places = [];

            $scope.hasResults = false;
            var limit = 10;

            placesExplorerService.get({ near: $scope.restaurantData.location, query: $scope.restaurantData.name, limit: limit }, function (placesResult) {
                console.log(JSON.stringify(placesResult));
                if (placesResult.response.minivenues) {
                    $scope.places = placesResult.response.minivenues;
                    $scope.hasResults = true;
                }
                else {
                    $scope.places = [];
                    $scope.hasResults = false;
                }
            });
        };

        //store info from fsquare and move to next view
        $scope.selectPlace = function(placeMetadata){
            console.log(placeMetadata);
            $scope.restaurantData.name = placeMetadata.name;
            $scope.restaurantData.address = placeMetadata.location.address;
            $scope.restaurantData.location = placeMetadata.location.city;
            $scope.restaurantData.fsquareID = placeMetadata.id;
            if ("crossStreet" in placeMetadata.location){
                $scope.restaurantData.crossStreet = placeMetadata.location.crossStreet;
            }
            else
            {
                $scope.restaurantData.crossStreet = "N/A"
            }

            $scope.restaurantData.longitude = placeMetadata.location.lng;
            $scope.restaurantData.latitude = placeMetadata.location.lat;
            $state.go('app.addReview.required',{},{reload: false});
        };

        ////testing
        //$scope.items = ['item1', 'item2', 'item3'];
        //
        //$scope.open = function (size) {
        //
        //    var modalInstance = $modal.open({
        //        templateUrl: 'partials/addReview-manual.html',
        //        controller: 'ModalInstanceCtrl',
        //        size: size,
        //        resolve: {
        //            items: function () {
        //                return $scope.items;
        //            }
        //        }
        //    });
        //
        //    modalInstance.result.then(function (selectedItem) {
        //        $scope.selected = selectedItem;
        //    }, function () {
        //        $log.info('Modal dismissed at: ' + new Date());
        //    });
        //}
////////////////////////////////////////////////
    }])

    .controller('homeController', ['$scope', '$firebase', '$http', function($scope,$firebase,$http) {
        function getArrayFromObject(object) {
            var array = [];
            for (var key in object) {
                var item = object[key];
                item.id = key;
                array.push(item);
            }
            return array;
        }


        var firebaseObj = new Firebase('https://dazzling-heat-4525.firebaseio.com//restaurant');
        //ref.orderByKey().startAt("b").endAt("b~").on("child_added", function(snapshot) {
        //    console.log(snapshot.key());
        //});
        firebaseObj.once('value', function(dataSnapshot) {

            //GET DATA
            var data = dataSnapshot.val();
            var restaurants = getArrayFromObject(data);

            //$scope.counter = 7;

            //var numOfReview = Object.keys(restaurants).length;
            //var numOfRestaurants = Object.keys(restaurants).length;
            if (!restaurants.length) return;

            // Attach list of selected observations to each review)
            restaurants.forEach(function (restaurant) {
                restaurant.reviews = getArrayFromObject(restaurant.reviews);

                // pandai pandai la
                restaurant.observations = Object.keys(restaurant.observations)
                    .filter(function (key) {
                        return restaurant.observations[key];
                    });
            });

            $scope.$apply(function () {
                $scope.restaurants = restaurants;
            });
        });

    }])

    .controller('feedbackController', ['$scope', '$firebase','$state', '$http', function($scope,$firebase,$state,$http) {
        // we will store all of the feedback specific data here
        $scope.feedback = {};

        //add date to the reviewer list
        d = new Date();
        $scope.feedback.date = d;

        $scope.submitFeedback = function() {
            // create feedback object from firebase
            var feedbackRef = new Firebase('https://dazzling-heat-4525.firebaseio.com/feedback');
            feedbackRef.push($scope.feedback);
            $state.go('app.home', {}, {reload: true});
        }


    }])

    .filter('list', function () {
        return function (array) {
            if (!Array.isArray(array)) return;

            return array.join(', ');
        };
    });

