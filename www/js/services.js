angular.module('starter.services', [])

.factory('User', function() {

  var o = {
    matches: [],
    newMatches: 0
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

});
