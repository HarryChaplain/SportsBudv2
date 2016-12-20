angular.module('starter.services', ['firebase'])

.factory('User', function() {

  var o = {
    matches: [],
    newMatches: 0
  }

  o.getMatches = function(){
    return o.matches;
  }

  o.matchesCount = function() {
    return o.newMatches;
  }

  o.addOppToMatches = function() {

    o.newMatches++;
  }

  o.removeOppFromMatches = function(opponent, index){

    if(!opponent) return false;

    o.matches.splice(index, 1);
  }

  return o;

})

.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {

    return $firebaseAuth();
  }
])

.factory("Matches", function($firebaseObject) {
    return function(username, matchID) {
      // create a reference to the database node where we will store our data
      var ref = firebase.database().ref("Matches");
      var matchesRef = ref.child(username).child(matchID);

      // return it as a synchronized object
      return $firebaseObject(matchesRef);
    }
  }
)


.factory("Profile", function($firebaseObject) {
    return function(username) {
      // create a reference to the database node where we will store our data
      var ref = firebase.database().ref("Profile");
      var profileRef = ref.child(username);

      // return it as a synchronized object
      return $firebaseObject(profileRef);
    }
  }
);
