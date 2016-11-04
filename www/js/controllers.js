angular.module('starter.controllers', [])

.controller('DiscoverCtrl', function($scope, $timeout, User) {
    $scope.opponents = [
       {
          "name":"Adam",
          "request":"Wants to play tennis",
          "image_small":"img/adam.jpg",
          "image_large":"img/adam.jpg"
       },
       {
           "name":"Ben",
           "request":"Wants to play golf",
           "image_small":"img/ben.png",
           "image_large":"img/ben.png"
       },
       {
           "name":"Mike",
           "request":"Wants to play Snooker",
           "image_small":"img/mike.png",
           "image_large":"img/mike.png"
       },
       {
           "name":"Perry",
           "request":"Wants to play squash",
           "image_small":"img/perry.png",
           "image_large":"img/perry.png"
       },
       {
           "name":"Max",
           "request":"Wants to play Basketball",
           "image_small":"img/max.png",
           "image_large":"img/max.png"
       }]

    $scope.currentOpp = angular.copy($scope.opponents[0]);

    $scope.sendFeedback = function (bool) {

      if(bool) User.addOppToMatches($scope.currentOpp);

      $scope.currentOpp.rated = bool;
      $scope.currentOpp.hide = true;

      $timeout(function(){
        // set the current song to one of our three songs
        var randomOpp = Math.round(Math.random() * ($scope.opponents.length));

         // update current song in scope
        $scope.currentOpp = angular.copy($scope.opponents[randomOpp]);

      }, 250);



    }

})

.controller('MatchesCtrl', function($scope, User) {

  $scope.matches = User.matches;

  $scope.removeOpp = function(opponent, index){
    User.removeOppFromMatches(opponent, index);
  }
});
