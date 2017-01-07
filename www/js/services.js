angular.module('starter.services', ['firebase'])


.factory("Auth", function($firebaseAuth) {
    return $firebaseAuth();
  }
)

.factory("Matches", function($firebaseObject, $firebaseArray) {

  var m = {
    matches: []
  };

  m.addMatch = function(currentUser, matchID, currentOpp) {
    var ref = firebase.database().ref("Matches");
    var addMatchRef = ref.child(currentUser).child(matchID);
    m.matches = $firebaseObject(addMatchRef);
    m.matches = angular.extend(m.matches, currentOpp);
    m.matches.$save();
    var matchesRef = ref.child(currentUser);
    m.matches = $firebaseArray(matchesRef);
  }

  m.getMatches = function(currentUser){
    var ref = firebase.database().ref("Matches");
    var matchesRef = ref.child(currentUser);
    m.matches = $firebaseArray(matchesRef);
    return m.matches;
  }

  m.removeMatch = function(index){
    m.matches.$remove(index);
  }

  m.destroy = function(){
    if (m.matches) {
      m.matches = null;
    }
  }


  return m;
})

.factory("Opponents", function($firebaseArray) {

  var opponents = [];



  opponents.getOpponents = function(){
    var ref = firebase.database().ref("Profile");
    //opponents = [];
    opponents = $firebaseArray(ref);
    return opponents;
  }

  opponents.destroy = function(){
    //opponents.$destroy();
    opponents = null;
  }

  return opponents;
  }
)

.factory("Messages", function($firebaseArray) {

  var messages = [];

  messages.getMessages = function(){
    var ref = firebase.database().ref("Messages");
    messages = $firebaseArray(ref);

    return messages;
  }

  messages.sendMessage = function(message){
    messages.$add(message);
  }

  messages.logout = function(){

    messages = null;
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

  profile.getFirstname = function(){
    return  profile.firstname;
  }

  profile.destroy = function(){
    profile.$destroy();
    profile = null;
  }



  return profile;
  }
);
