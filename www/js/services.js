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

    m.matches.$loaded()
      .then(function(data){
        return data;
      })
      .catch(function(error){
        console.log(error);
        return null;
      });

    return m.matches;
  }

  m.removeMatch = function(index){
    m.matches.$remove(index);
  }

  m.getSpecificMat = function(oppId){
    for (var i = 0; i < m.matches.length; i++) {
        if (m.matches[i].$id === oppId) {
          return m.matches[i];
        }
      }
      return null;
  }

  return m;
  }
)

.factory("Opponents", function($firebaseArray) {

  var opponents = [];

  var ref = firebase.database().ref("Profile");



  opponents.getOpponents = function(){
    opponents = [];
    opponents = $firebaseArray(ref);
    return opponents;
  }

  return opponents;
  }
)

.factory("Messages", function($firebaseArray) {

  var messages = [];

  var ref = firebase.database().ref("Messages");
  messages = $firebaseArray(ref);


  messages.getMessages = function(){

    return messages;
  }

  messages.sendMessage = function(message){
    messages.$add(message);
  }

  return messages;
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
