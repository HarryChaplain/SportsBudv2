angular.module('starter.controllers', [])

.controller('DiscoverCtrl', function($scope, $timeout, $state, Auth, $firebaseArray, $cordovaGeolocation, Profile, Matches, Opponents, $ionicPopup) {

  $scope.auth = Auth;
  var oppCount = 0;
  //$scope.filteredOpps = [];
  $scope.currentOpp = null;


  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      oppCount= 0;

      $scope.firebaseUser = firebaseUser;
      $scope.currentUser = Profile.getProfile(firebaseUser.uid);

      $scope.watch = $cordovaGeolocation.watchPosition();
      $scope.load();

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
      $state.go('login', {}, {reload: true});
      $state.reload()
      Matches.destroy();
      Opponents.destroy();
      $scope.auth.$signOut();
      $scope.firebaseUser = undefined;
      $scope.opponents.$destroy();
      $scope.currentOpp = null;
      $scope.filteredOpps = null;
      $scope.watch.clearWatch();

      console.log("logged out");
    };
  });

  $scope.showAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Alert!',
      template: 'Create and save a profile to look of opponents'
    });
    alertPopup.then(function(res) {
      $state.go('tab.account');
    });
  };

  $scope.reloadWatch = function(){
    $scope.$on("$ionicView.beforeEnter", function() {
        $scope.message = "";
        //delete $scope.opponents
        $scope.currentOpp = null;
        $scope.load();
    });
  }

  $scope.load = function() {


    $scope.opponents = Opponents.getOpponents();
    $scope.filteredOpps = [];

    $scope.opponents.$loaded()
      .then(function(data){

        $scope.reloadWatch();

        for(var i = 0; i < data.length; ++i){
          $scope.calcDistance($scope.currentLat, $scope.currentLong, data[i].lat, data[i].long);
          if($scope.distance <= $scope.currentUser.searchDist && $scope.currentUser.sport == data[i].sport && data[i].$id != $scope.firebaseUser.uid){
            $scope.filteredOpps.push(data[i])
          }
        }
        $scope.opponents.$destroy();
        if( $scope.filteredOpps[oppCount] && $scope.filteredOpps[oppCount].$id != $scope.firebaseUser.uid){
          $scope.currentOpp = angular.copy($scope.filteredOpps[oppCount]);
          $scope.calcDistance($scope.currentLat, $scope.currentLong, $scope.currentOpp.lat, $scope.currentOpp.long);
        }else if($scope.filteredOpps[oppCount]){
          $scope.currentOpp = angular.copy($scope.filteredOpps[oppCount]);
          $scope.sendFeedback(false);
        }

        if($scope.filteredOpps[oppCount] == undefined){
          $scope.message = "No new matches nearby";
        }else {
          $scope.message = "";
        }

        $scope.opponents.$destroy();
      })
      .catch(function(error){
          console.log(error);
      });
  }

  $scope.reload = function(){
    $scope.message = "";
    oppCount = 0;
    Opponents.destroy();
    delete $scope.opponents;
    $scope.currentOpp = null;
    $timeout(function(){
      $scope.load();
    },1000);
  }


  $scope.sendFeedback = function (bool) {

    if(bool) {
      Matches.addMatch($scope.firebaseUser.uid,$scope.currentOpp.$id, $scope.currentOpp);
    }

    $scope.currentOpp.rated = bool;
    $scope.currentOpp.hide = true;

    $timeout(function(){
      ++oppCount;
      oppCount = oppCount % ($scope.filteredOpps.length);

      if($scope.filteredOpps[oppCount] && $scope.filteredOpps[oppCount].$id == $scope.firebaseUser.uid){
        ++oppCount;
        if ($scope.filteredOpps[oppCount] == undefined) {
          $scope.currentOpp = null;
          return;
        }
      }

      $scope.currentOpp = angular.copy($scope.filteredOpps[oppCount]);
      $scope.calcDistance($scope.currentLat, $scope.currentLong, $scope.currentOpp.lat, $scope.currentOpp.long);
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
      $scope.distance = 1;
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

.controller('AccountCtrl', function($ionicHistory, $scope, $state, Auth, Profile, $cordovaGeolocation, $cordovaCamera, $timeout, Opponents, Messages,$ionicPopup, Matches) {

  $scope.auth = Auth;
  $scope.profile = {};
  $scope.profile.searchDist = 50;


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
      $scope.auth.$signOut();

      $state.go('login', {}, {reload: true});
      if ($scope.profile) {
        $scope.profile = null;
      }
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

  $scope.successAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Success!',
      template: 'Profile Saved Successfully'
    });
    alertPopup.then(function(res) {
    });
  }

  $scope.saveProfile = function() {
    $scope.profile.$save().then(function() {
        $scope.successAlert();
        //Opponents.destroy();
      }).catch(function(error) {
        alert(error);
      });
  }

  $scope.logout = function() {
    firebase.auth().signOut().then(function() {
      console.log("logged out");


      $scope.watch.clearWatch();

      $scope.profile.images = {profilePic: null};
      $state.go('login', {}, {reload: true});
    }, function(error) {
      console.log(error);
    });
  };
})

.controller('LoginCtrl',  function($scope, Auth, $state, $ionicPopup, $ionicNavBarDelegate) {

  $ionicNavBarDelegate.showBackButton(false);

  $scope.$on("$ionicView.beforeEnter", function() {

    $timeout(function () {
        $ionicHistory.clearCache();
        $ionicHistory.clearHistory();
        Auth.$signOut();

    },300)

  });

  $scope.signIn = function() {
    $scope.message = null;
    $scope.error = null;

    Auth.$signInWithEmailAndPassword($scope.email, $scope.password).then(function(firebaseUser) {
      $scope.email = '';
      $scope.password = '';
      $scope.auth = Auth;
      $state.go('tab.account');
    }).catch(function(error) {
      $scope.error = error;
      $scope.password = '';
    });

  };

  $scope.successAlert = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Success!',
      template: 'New Account Created'
    });
    alertPopup.then(function(res) {
      $scope.auth = Auth;
      $state.go('tab.account');
    });
  }

  $scope.createUser = function() {
    $scope.message = null;
    $scope.error = null;


    Auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
      .then(function(firebaseUser) {
        $scope.message = "User created with email: " + firebaseUser.email;
        $scope.email = '';
        $scope.password = '';
        $scope.successAlert();

      }).catch(function(error) {
        $scope.error = error;
      });
    };
})
.controller('MatchesCtrl', function($scope, Auth, $state, Matches) {

  $scope.auth = Auth;

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser){
      $scope.matches = Matches.getMatches(firebaseUser.uid);
    }else{
      console.log($scope);

      $scope.auth.$signOut();
      $scope.matches.$destroy();
      Matches.destroy();
      $state.go('login', {}, {reload: true});
      $scope.matches = null;

    };
  });

  $scope.removeOpp = function(index){
    Matches.removeMatch(index);
  }
})
.controller('ChatCtrl', function($ionicNavBarDelegate, $scope, $stateParams, Auth, Messages, $state, Profile, $ionicScrollDelegate) {

  $ionicNavBarDelegate.showBackButton(true);
  $scope.auth = Auth;
  $scope.allMessages = [];
  $scope.filteredMessages = [];
  $scope.tempMessages = [];

  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    if(firebaseUser && $stateParams.chatId){
        $scope.opponent = Profile.getProfile($stateParams.chatId);
        $scope.message.fromID = firebaseUser.uid;
        $scope.currentUser = Profile.getProfile(firebaseUser.uid);
        $scope.loadMessages();

    }else if(!firebaseUser){
        Messages.logout();
        $scope.auth.$signOut();
        $scope.allMessages.$destroy();
        $scope.opponent.$destroy();
        $scope.currentUser.$destroy();
        $stateParams.chatId = null;
        $state.go('login', {}, {reload: true});
        console.log("logged out");

      };
  });

  $scope.loadMessages = function(){
    $scope.allMessages = Messages.getMessages();
    $scope.allMessages.$loaded()
      .then(function(data){
        $scope.filterMessges();
        $scope.allMessages.$watch(function(event) {
          if (event.event = "child_added") {
            $scope.filterMessges();
          }
        });
      })
      .catch(function(error){
        console.log(error);
      });
  }

  $scope.scrollBottom = function(){
    $ionicScrollDelegate.scrollBottom();
  }

  $scope.filterMessges = function(){
    $scope.tempMessages = [];
    for(var i = 0; i < $scope.allMessages.length; ++i){
      if(($scope.allMessages[i].fromID == $scope.opponent.$id && $scope.allMessages[i].toID == $scope.currentUser.$id) || ($scope.allMessages[i].fromID == $scope.currentUser.$id && $scope.allMessages[i].toID == $scope.opponent.$id))
        $scope.tempMessages.push($scope.allMessages[i])

    }
    $scope.filteredMessages = $scope.tempMessages;
    $scope.tempMessages = [];

  }

  $scope.message = {};
  $scope.message.toID = $stateParams.chatId;

  $scope.sendMessage = function() {
    $scope.message.from = $scope.currentUser.firstname;

    if ($scope.message.content) {
      Messages.sendMessage($scope.message);
      $scope.scrollBottom();
      $scope.message.content = '';
    }

  }
});
