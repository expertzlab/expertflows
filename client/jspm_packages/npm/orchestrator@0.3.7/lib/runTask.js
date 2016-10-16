/* */ 
(function(process) {
  "use strict";
  var eos = require('end-of-stream');
  var consume = require('stream-consume');
  module.exports = function(task, done) {
    var that = this,
        finish,
        cb,
        isDone = false,
        start,
        r;
    finish = function(err, runMethod) {
      var hrDuration = process.hrtime(start);
      if (isDone && !err) {
        err = new Error('task completion callback called too many times');
      }
      isDone = true;
      var duration = hrDuration[0] + (hrDuration[1] / 1e9);
      done.call(that, err, {
        duration: duration,
        hrDuration: hrDuration,
        runMethod: runMethod
      });
    };
    cb = function(err) {
      finish(err, 'callback');
    };
    try {
      start = process.hrtime();
      r = task(cb);
    } catch (err) {
      return finish(err, 'catch');
    }
    if (r && typeof r.then === 'function') {
      r.then(function() {
        finish(null, 'promise');
      }, function(err) {
        finish(err, 'promise');
      });
    } else if (r && typeof r.pipe === 'function') {
      eos(r, {
        error: true,
        readable: r.readable,
        writable: r.writable && !r.readable
      }, function(err) {
        finish(err, 'stream');
      });
      consume(r);
    } else if (task.length === 0) {
      finish(null, 'sync');
    }
  };
})(require('process'));
