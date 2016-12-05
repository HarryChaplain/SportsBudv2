angular.module('starter.controllers', [])

.controller('DiscoverCtrl', function($scope, $timeout, User, $state, Auth) {

  $scope.auth = Auth;

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      console.log("logged in");
    }else{
    $state.go('login');
    };
  });

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
.controller('TabsCtrl', function($scope, User) {

  $scope.matchCount = User.matchesCount;

  $scope.enteringMatches = function(){
    User.newMatches = 0;
  }

})

.controller('AccountCtrl', function($scope, User, $state, Auth, Profile) {

  $scope.auth = Auth;

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      $scope.firebaseUser = firebaseUser;
      $scope.profile = Profile(firebaseUser.uid);
    }else{
      $state.go('login');
    };
  });

  $scope.dist = 50;

  $scope.saveProfile = function() {
    $scope.profile.$save().then(function() {
        alert('Profile saved!');
      }).catch(function(error) {
        alert('Error!');
      });
  }

  $scope.logout = function() {

    firebase.auth().signOut().then(function() {
      console.log("logged out");
      $state.go('login');
    }, function(error) {
      console.log(error);
    });


  };


})

.controller('LoginCtrl', ['$scope', 'Auth', "$state", function($scope, Auth, $state) {

  $scope.signIn = function() {
    $scope.message = null;
    $scope.error = null;

    // Delete the currently signed-in user
    Auth.$signInWithEmailAndPassword($scope.email, $scope.password).then(function(firebaseUser) {
      $scope.message = "logged in with id:" + firebaseUser.email;
      $scope.auth = Auth;
      $state.go('tab.discover');
    }).catch(function(error) {
      $scope.error = error;
    });

  };

}])


.controller('MatchesCtrl', function($scope, User, Auth, $state) {

  $scope.auth = Auth;

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      console.log("logged in");
    }else{
    $state.go('login');
    };
  });

  $scope.matches = User.matches;


  $scope.removeOpp = function(opponent, index){
    User.removeOppFromMatches(opponent, index);
  }
});
