angular.module('starter.controllers', [])

.controller('DiscoverCtrl', function($scope, $timeout, $state, Auth, $firebaseArray, $timeout, $cordovaGeolocation, Profile, Matches, Opponents) {

  $scope.auth = Auth;
  var i = 0;

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
        $scope.firebaseUser = firebaseUser;
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
        $scope.load();

    }else{
        $scope.opponents.$destroy();
        $scope.watch.clearWatch();
        $state.go('login');
        console.log("logged out");

      };
  });

    $scope.load = function() {
      $scope.opponents = Opponents.getOpponents();

      $scope.opponents.$loaded()
        .then(function(data){
          $scope.currentOpp = angular.copy(data[0]);
          $scope.calcDistance($scope.currentLat, $scope.currentLong, $scope.currentOpp.lat, $scope.currentOpp.long);
        })
        .catch(function(error){
          console.log(error);
          return null;
        });
    }

    $scope.reload = function(){
      $scope.opponents.$destroy();
      $scope.currentOpp = null;
      $scope.load();
    }


    $scope.sendFeedback = function (bool) {

      if(bool) {
        Matches.addMatch($scope.firebaseUser.uid,$scope.currentOpp.$id, $scope.currentOpp);
      }

      $scope.currentOpp.rated = bool;
      $scope.currentOpp.hide = true;
      $timeout(function(){
          i = i + 1;
          i = i % $scope.opponents.length;
          if($scope.opponents[i])
          {
            $scope.currentOpp = angular.copy($scope.opponents[i]);
            $scope.calcDistance($scope.currentLat, $scope.currentLong, $scope.currentOpp.lat, $scope.currentOpp.long);
          }
      }, 250);

    }



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
      if(d < 1){
        $scope.distance = "Less than 1";
      }else{
        $scope.distance = Math.round(d);
      }
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

})
.controller('TabsCtrl', function($scope) {


})

.controller('AccountCtrl', function($scope, $state, Auth, Profile, $cordovaGeolocation, $cordovaCamera, $timeout, Opponents, Messages) {

  $scope.auth = Auth;

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      $scope.firebaseUser = firebaseUser;
      $scope.profile = Profile.getProfile(firebaseUser.uid);
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
      $scope.profile.$destroy();
      $state.go('login');
    };
  });

  $scope.upload = function() {

        var options = {
            quality : 75,
            destinationType : Camera.DestinationType.DATA_URL,
            sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit : true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            targetWidth: 500,
            targetHeight: 500,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {

             $scope.profile.images = {profilePic: imageData};
        }, function(error) {
            console.error(error);
        });
    }

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
      $scope.profile.$destroy();

    }, function(error) {
      console.log(error);
    });


  };


})

.controller('LoginCtrl',  function($scope, Auth, $state) {

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
        $scope.email = '';
        $scope.password = '';
      }).catch(function(error) {
        $scope.error = error;
      });
    };


  }


)
.controller('MatchesCtrl', function($scope, Auth, $state, Matches) {

  $scope.auth = Auth;

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      $scope.matches = Matches.getMatches(firebaseUser.uid);
    }else{
      $scope.matches.$destroy();
      $state.go('login');
      $scope.matches = null;
    };
  });

  $scope.removeOpp = function(index){
    Matches.removeMatch(index);
  }
})
.controller('ChatCtrl', function($scope, $stateParams, Matches, Auth, Messages, $timeout, $state) {

  $scope.auth = Auth;
  $scope.allMessages = [];
  $scope.currentMessages = [];
  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
        $scope.message.from = firebaseUser.uid;
        $scope.allMessages = Messages.getMessages();

    }else{
        $scope.allMessages.$destroy();
        $state.go('login');
        console.log("logged out");

      };
  });


  $timeout(function () {

    $scope.currentMessages = [];
    for(var i = 0; i < $scope.allMessages.length; i++){

    if(($scope.allMessages[i].from === $stateParams.chatId && $scope.allMessages[i].to === $scope.message.from) || ($scope.allMessages[i].to === $stateParams.chatId && $scope.allMessages[i].from === $scope.message.from)){
      $scope.currentMessages.push($scope.allMessages[i]);
      console.log($scope.currentMessages);
    }
  }
  }, 4000)

  $scope.opponent = Matches.getSpecificMat($stateParams.chatId);

    $scope.message = {};
    $scope.message.to = $stateParams.chatId;


  $scope.sendMessage = function() {
    Messages.sendMessage($scope.message);
    $scope.currentMessages.push($scope.message);
  }
});
