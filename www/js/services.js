angular.module('starter.services', ['firebase'])

.factory('User', function() {

  var o = {
    matches: [],
    newMatches: 0,
    name: 'Harry Chaplain'
  }

  o.matchesCount = function() {
    return o.newMatches;
  }

  o.addOppToMatches = function(opponent) {

    if(!opponent) return false;

    o.matches.unshift(opponent);
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
