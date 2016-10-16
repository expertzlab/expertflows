/* */ 
'use strict';
var path = require('path');
var findIndex = require('find-index');
var flattenGlob = function(arr) {
  var out = [];
  var flat = true;
  for (var i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string') {
      flat = false;
      break;
    }
    out.push(arr[i]);
  }
  if (flat) {
    out.pop();
  }
  return out;
};
var flattenExpansion = function(set) {
  var first = set[0];
  var toCompare = set.slice(1);
  var idx = findIndex(first, function(v, idx) {
    if (typeof v !== 'string') {
      return true;
    }
    var matched = toCompare.every(function(arr) {
      return v === arr[idx];
    });
    return !matched;
  });
  return first.slice(0, idx);
};
var setToBase = function(set) {
  if (set.length <= 1) {
    return flattenGlob(set[0]);
  }
  return flattenExpansion(set);
};
module.exports = function(glob) {
  var set = glob.minimatch.set;
  var baseParts = setToBase(set);
  var basePath = path.normalize(baseParts.join(path.sep)) + path.sep;
  return basePath;
};
