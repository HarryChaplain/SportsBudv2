angular.module('starter.controllers', [])

.controller('DiscoverCtrl', function($scope, $timeout, User, $state, Auth, $firebaseArray, $timeout, $cordovaGeolocation) {

  $scope.auth = Auth;
  $scope.profiles = [];

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      var ref = firebase.database().ref("Profile");
        var profiles = $firebaseArray(ref);
        $scope.firebaseUser = firebaseUser;
        $scope.user = firebaseUser.email;
        $scope.profiles = profiles;
        $scope.watch = $cordovaGeolocation.watchPosition();
        $scope.watch.then(
          null,
          function(err) {
            console.log(err);
          },
          function(position) {
            $scope.currentLat  = position.coords.latitude;
            $scope.currentLong = position.coords.longitude;
        });

    }else{
    $state.go('login');
    $scope.watch.clearWatch();

    };
  });

  $timeout(function () {

    var i = 0;

    $scope.currentOpp = angular.copy($scope.profiles[0]);

    $scope.calcDistance($scope.currentLat, $scope.currentLong, $scope.currentOpp.lat, $scope.currentOpp.long);

    $scope.sendFeedback = function (bool) {

      if(bool) User.addOppToMatches($scope.currentOpp);

      $scope.currentOpp.rated = bool;
      $scope.currentOpp.hide = true;
      $timeout(function(){
          i = i + 1;
          console.log(i);
          i = i % $scope.profiles.length;
          if($scope.profiles[i])
          {
            $scope.currentOpp = angular.copy($scope.profiles[i]);
            $scope.calcDistance($scope.currentLat, $scope.currentLong, $scope.currentOpp.lat, $scope.currentOpp.long);
          }
        }, 250);

      }

    }, 2000);

    $scope.calcDistance = function(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1);
      var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      $scope.distance = Math.round(d);
      ;
  }

  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }

})
.controller('TabsCtrl', function($scope, User) {

  $scope.matchCount = User.matchesCount;

  $scope.enteringMatches = function(){
    User.newMatches = 0;
  }

})

.controller('AccountCtrl', function($scope, User, $state, Auth, Profile, $cordovaGeolocation) {

  $scope.auth = Auth;



  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      $scope.firebaseUser = firebaseUser;
      $scope.profile = Profile(firebaseUser.uid);

      $scope.watch = $cordovaGeolocation.watchPosition();
      $scope.watch.then(
        null,
        function(err) {
          console.log(err);
        },
        function(position) {
          $scope.profile.lat  = position.coords.latitude
          $scope.profile.long = position.coords.longitude
      });

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
      $scope.watch.clearWatch();


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
      $state.go('tab.account');
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
