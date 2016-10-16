/* */ 
(function(process) {
  'use strict';
  var chalk = require('chalk');
  var timestamp = require('time-stamp');
  function getTimestamp() {
    return '[' + chalk.grey(timestamp('HH:mm:ss')) + ']';
  }
  function log() {
    var time = getTimestamp();
    process.stdout.write(time + ' ');
    console.log.apply(console, arguments);
    return this;
  }
  function error() {
    var time = getTimestamp();
    process.stderr.write(time + ' ');
    console.error.apply(console, arguments);
    return this;
  }
  module.exports = log;
  module.exports.error = error;
})(require('process'));
