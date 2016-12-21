angular.module('starter.services', ['firebase'])


.factory("Auth",
  function($firebaseAuth) {

    return $firebaseAuth();
  }
)

.factory("Matches", function($firebaseObject, $firebaseArray) {

  var m = {
    matches: []
  };

  var ref = firebase.database().ref("Matches");

  m.addMatch = function(currentUser, matchID, currentOpp) {
    var addMatchRef = ref.child(currentUser).child(matchID);
    m.matches = $firebaseObject(addMatchRef);
    m.matches = angular.extend(m.matches, currentOpp);
    m.matches.$save();
    }

  m.getMatches = function(currentUser){
    var matchesRef = ref.child(currentUser);
    m.matches = $firebaseArray(matchesRef);

    return m.matches;
  }

  m.removeMatch = function(index){
    m.matches.$remove(index);
  }

  return m;
  }
)

.factory("Opponents", function($firebaseArray) {

  var opp = {
    opponents: []
  };

  var ref = firebase.database().ref("Profile");



  opp.getOpponents = function(){
    opp.opponents = $firebaseArray(ref);


    return opp.opponents;
  }


  return opp;
  }
)


.factory("Profile", function($firebaseObject) {

  var profile = {};


  profile.getProfile = function(userID) {
    // create a reference to the database node where we will store our data
    var ref = firebase.database().ref("Profile");
    var profileRef = ref.child(userID);
    profile = $firebaseObject(profileRef)
    // return it as a synchronized object
    return profile;
    }


  return profile;
  }
);
