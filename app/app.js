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
    'ui.router',
    'firebase',
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
                /*
                 templateUrl: 'templates/partials/subscriber-detail.html',
                 controller: 'SubscriberDetailController'
                 */

                views: {

                    'form@app.addReview': {
                        templateUrl: 'partials/addReview-basic.html'
//                        controller: 'formController'
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
//                        controller: 'formController'
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
//                        controller: 'formController'
                    }
                }

            });

        // catch all route
        // send users to the form page
        $urlRouterProvider.otherwise('/');
    })

// our controller for the form
// =============================================================================
    .controller('formController', ['$scope', '$state', '$firebase', '$http', function($scope,$state,$firebase,$http) {

        // we will store all of our form data in this object
        $http.get('data/bmatrixParameters.json').success(function(data) {
            $scope.parameters = data;
        });

        // we will store all of the restaurant specific data here
        $scope.restaurantData = {};
        // we will store all of the reviewer's specific data here
        $scope.reviewerData = {};

        // function to process the form
        $scope.processForm = function() {
            var temp = $scope.restaurantData;
            alert(temp);
        };

        $scope.restaurantData = {
            ambiances: {
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
            }
        };

        $scope.reviewerData = {
            'cost': '$'
        };

        $scope.AddPost = function(){
            var name = $scope.restaurantData.name;
            var reviewer = $scope.reviewerData.reviewer;

            //add date to the reviewer list
            $scope.reviewerData.date = new Date();

            // Making a copy so that you don't mess with original user input
            var payloadRestaurant = angular.copy($scope.restaurantData);
            var payloadReviewer = angular.copy($scope.reviewerData);

            // create restaurant object from firebase
            var restoRef = new Firebase('https://dazzling-heat-4525.firebaseio.com/restaurant');
            var reviewsUrl = "";
            var fbReviews = {};

            restoRef.orderByChild("name").startAt(name).endAt(name).once('value', function(dataSnapshot) {
                //GET DATA

                if (dataSnapshot.exists()){
                    var data = dataSnapshot.val();
                    var key = Object.keys(data)[0];
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

    }])

    .controller('homeController', ['$scope', '$firebase', '$http', function($scope,$firebase, $http ) {
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

            // Attach list of selected ambiances to each review)
            restaurants.forEach(function (restaurant) {
                restaurant.reviews = getArrayFromObject(restaurant.reviews);

                // pandai pandai la
                restaurant.ambiances = Object.keys(restaurant.ambiances)
                    .filter(function (key) {
                        return restaurant.ambiances[key];
                    });
            });

            $scope.$apply(function () {
                $scope.restaurants = restaurants;
            });
        });

        //// we will store all of our form data in this object
        //$http.get('data/reviews.json').success(function(data) {
        //    $scope.reviews = data;
        //});

    }])

    .filter('list', function () {
        return function (array) {
            if (!Array.isArray(array)) return;

            return array.join(', ');
        };
    });


