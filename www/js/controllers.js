angular.module('starter.controllers', [])

.controller('DiscoverCtrl', function($scope, $timeout, User, $state, Auth, $firebaseArray, $timeout) {

  $scope.auth = Auth;
  $scope.profiles = [];

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      var ref = firebase.database().ref("Profile");
        var profiles = $firebaseArray(ref);
        $scope.firebaseUser = firebaseUser;
        $scope.user = firebaseUser.email;
        $scope.profiles = profiles;

    }else{
    $state.go('login');
    };
  });

  $timeout(function () {

    $scope.currentOpp = angular.copy($scope.profiles[0]);

    $scope.sendFeedback = function (bool) {

      if(bool) User.addOppToMatches($scope.currentOpp);

      $scope.currentOpp.rated = bool;
      $scope.currentOpp.hide = true;

      $timeout(function(){
        var randomOpp = Math.round(Math.random() * ($scope.profiles.length));

        $scope.currentOpp = angular.copy($scope.profiles[randomOpp]);

        }, 250);

      }

    }, 2000);

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
      $scope.email = '';
      $scope.password = '';
      $scope.auth = Auth;
      $state.go('tab.discover');
    }).catch(function(error) {
      $scope.error = error;
    });

  };

  $scope.createUser = function() {
    $scope.message = null;
    $scope.error = null;

    Auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
      .then(function(firebaseUser) {
        $scope.message = "User created with email: " + firebaseUser.email;

      }).catch(function(error) {
        $scope.error = error;
      });
    };
  }


])


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
