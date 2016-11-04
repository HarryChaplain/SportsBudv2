angular.module('starter.services', [])

.factory('User', function() {

  var o = {
    matches: []
  }

  o.addOppToMatches = function(opponent) {

    if(!opponent) return false;

    o.matches.unshift(opponent);
  }

  o.removeOppFromMatches = function(opponent, index){

    if(!opponent) return false;

    o.matches.splice(index, 1);    
  }

  return o;

});
