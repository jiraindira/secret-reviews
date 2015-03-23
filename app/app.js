/**
 * Created by Jiraindira on 12/15/14.
 */
if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

angular.module('formApp', ['ngAnimate', 'ui.router', 'firebase'])

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
    .controller('formController', ['$scope', '$firebase', '$http', function($scope,$firebase,$http) {

        // we will store all of our form data in this object
        $http.get('data/bmatrixParameters.json').success(function(data) {
            $scope.parameters = data;
        });

        // we will store all of our form data in this object
        $scope.formData = {};

        // function to process the form
        $scope.processForm = function() {
            var temp = $scope.formData;
            alert(temp);
        };

        $scope.formData = {
            cost: '$',
            //dateSpot : false,
            //catchUpSpot : false,
            //businessSpot : false,
            ambiances: {
                'Date Spot': true,
                'Catch Up Spot': false,
                'Business Spot': false
            }
        };

        $scope.AddPost = function(){
            var reviewer = $scope.formData.reviewer;
            var name = $scope.formData.name;
            var location = $scope.formData.location;
            var taste = $scope.formData.taste;
            var ambiances = $scope.formData.ambiances;
            //var dateSpot = $scope.formData.dateSpot;
            //var catchUpSpot = $scope.formData.catchUpSpot;
            //var businessSpot = $scope.formData.businessSpot;
            var verdict = $scope.formData.verdict;
            var cost = $scope.formData.cost;
            var dishes = $scope.formData.dishes;
            var caption = $scope.formData.caption;
            var key = reviewer.concat("-",name);


            var firebaseObj = new Firebase('https://dazzling-heat-4525.firebaseio.com//list');
            var fb = $firebase(firebaseObj.child(key));

            // Making a copy so that you don't mess with original user input
            var payload = angular.copy($scope.formData);
            payload.key = key;

            fb.$set(payload).then(function(ref) {
                console.log(ref);
            }, function(error) {
                console.log("Error:", error);
            });
        };

    }])

    .controller('homeController', ['$scope', '$firebase', '$http', function($scope,$firebase, $http ) {

        var firebaseObj = new Firebase('https://dazzling-heat-4525.firebaseio.com//list');

        firebaseObj.once('value', function(dataSnapshot) {

            //GET DATA
            var data = dataSnapshot.val();
            var reviews = data;

            var numOfReviews = Object.keys(reviews).length;
            if (!numOfReviews) return;

            // Attach list of selected ambiances to each review)
            for (var key in reviews) {
                var review = reviews[key];

                review.ambiances = Object.keys(review.ambiances)
                    .filter(function (key) {
                        return review.ambiances[key];
                    });
                console.log('omg', review.ambiances)
            }

            $scope.$apply(function () {
                $scope.reviews = reviews;
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


