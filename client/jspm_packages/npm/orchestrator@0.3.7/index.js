/* */ 
"use strict";
var util = require('util');
var events = require('events');
var EventEmitter = events.EventEmitter;
var runTask = require('./lib/runTask');
var Orchestrator = function() {
  EventEmitter.call(this);
  this.doneCallback = undefined;
  this.seq = [];
  this.tasks = {};
  this.isRunning = false;
};
util.inherits(Orchestrator, EventEmitter);
Orchestrator.prototype.reset = function() {
  if (this.isRunning) {
    this.stop(null);
  }
  this.tasks = {};
  this.seq = [];
  this.isRunning = false;
  this.doneCallback = undefined;
  return this;
};
Orchestrator.prototype.add = function(name, dep, fn) {
  if (!fn && typeof dep === 'function') {
    fn = dep;
    dep = undefined;
  }
  dep = dep || [];
  fn = fn || function() {};
  if (!name) {
    throw new Error('Task requires a name');
  }
  if (typeof name !== 'string') {
    throw new Error('Task requires a name that is a string');
  }
  if (typeof fn !== 'function') {
    throw new Error('Task ' + name + ' requires a function that is a function');
  }
  if (!Array.isArray(dep)) {
    throw new Error('Task ' + name + ' can\'t support dependencies that is not an array of strings');
  }
  dep.forEach(function(item) {
    if (typeof item !== 'string') {
      throw new Error('Task ' + name + ' dependency ' + item + ' is not a string');
    }
  });
  this.tasks[name] = {
    fn: fn,
    dep: dep,
    name: name
  };
  return this;
};
Orchestrator.prototype.task = function(name, dep, fn) {
  if (dep || fn) {
    this.add(name, dep, fn);
  } else {
    return this.tasks[name];
  }
};
Orchestrator.prototype.hasTask = function(name) {
  return !!this.tasks[name];
};
Orchestrator.prototype.start = function() {
  var args,
      arg,
      names = [],
      lastTask,
      i,
      seq = [];
  args = Array.prototype.slice.call(arguments, 0);
  if (args.length) {
    lastTask = args[args.length - 1];
    if (typeof lastTask === 'function') {
      this.doneCallback = lastTask;
      args.pop();
    }
    for (i = 0; i < args.length; i++) {
      arg = args[i];
      if (typeof arg === 'string') {
        names.push(arg);
      } else if (Array.isArray(arg)) {
        names = names.concat(arg);
      } else {
        throw new Error('pass strings or arrays of strings');
      }
    }
  }
  if (this.isRunning) {
    this._resetSpecificTasks(names);
  } else {
    this._resetAllTasks();
  }
  if (this.isRunning) {
    names = names.concat(this.seq);
  }
  if (names.length < 1) {
    for (i in this.tasks) {
      if (this.tasks.hasOwnProperty(i)) {
        names.push(this.tasks[i].name);
      }
    }
  }
  seq = [];
  try {
    this.sequence(this.tasks, names, seq, []);
  } catch (err) {
    if (err) {
      if (err.missingTask) {
        this.emit('task_not_found', {
          message: err.message,
          task: err.missingTask,
          err: err
        });
      }
      if (err.recursiveTasks) {
        this.emit('task_recursion', {
          message: err.message,
          recursiveTasks: err.recursiveTasks,
          err: err
        });
      }
    }
    this.stop(err);
    return this;
  }
  this.seq = seq;
  this.emit('start', {message: 'seq: ' + this.seq.join(',')});
  if (!this.isRunning) {
    this.isRunning = true;
  }
  this._runStep();
  return this;
};
Orchestrator.prototype.stop = function(err, successfulFinish) {
  this.isRunning = false;
  if (err) {
    this.emit('err', {
      message: 'orchestration failed',
      err: err
    });
  } else if (successfulFinish) {
    this.emit('stop', {message: 'orchestration succeeded'});
  } else {
    err = 'orchestration aborted';
    this.emit('err', {
      message: 'orchestration aborted',
      err: err
    });
  }
  if (this.doneCallback) {
    this.doneCallback(err);
  } else if (err && !this.listeners('err').length) {
    throw err;
  }
};
Orchestrator.prototype.sequence = require('sequencify');
Orchestrator.prototype.allDone = function() {
  var i,
      task,
      allDone = true;
  for (i = 0; i < this.seq.length; i++) {
    task = this.tasks[this.seq[i]];
    if (!task.done) {
      allDone = false;
      break;
    }
  }
  return allDone;
};
Orchestrator.prototype._resetTask = function(task) {
  if (task) {
    if (task.done) {
      task.done = false;
    }
    delete task.start;
    delete task.stop;
    delete task.duration;
    delete task.hrDuration;
    delete task.args;
  }
};
Orchestrator.prototype._resetAllTasks = function() {
  var task;
  for (task in this.tasks) {
    if (this.tasks.hasOwnProperty(task)) {
      this._resetTask(this.tasks[task]);
    }
  }
};
Orchestrator.prototype._resetSpecificTasks = function(names) {
  var i,
      name,
      t;
  if (names && names.length) {
    for (i = 0; i < names.length; i++) {
      name = names[i];
      t = this.tasks[name];
      if (t) {
        this._resetTask(t);
        if (t.dep && t.dep.length) {
          this._resetSpecificTasks(t.dep);
        }
      }
    }
  }
};
Orchestrator.prototype._runStep = function() {
  var i,
      task;
  if (!this.isRunning) {
    return;
  }
  for (i = 0; i < this.seq.length; i++) {
    task = this.tasks[this.seq[i]];
    if (!task.done && !task.running && this._readyToRunTask(task)) {
      this._runTask(task);
    }
    if (!this.isRunning) {
      return;
    }
  }
  if (this.allDone()) {
    this.stop(null, true);
  }
};
Orchestrator.prototype._readyToRunTask = function(task) {
  var ready = true,
      i,
      name,
      t;
  if (task.dep.length) {
    for (i = 0; i < task.dep.length; i++) {
      name = task.dep[i];
      t = this.tasks[name];
      if (!t) {
        this.stop("can't run " + task.name + " because it depends on " + name + " which doesn't exist");
        ready = false;
        break;
      }
      if (!t.done) {
        ready = false;
        break;
      }
    }
  }
  return ready;
};
Orchestrator.prototype._stopTask = function(task, meta) {
  task.duration = meta.duration;
  task.hrDuration = meta.hrDuration;
  task.running = false;
  task.done = true;
};
Orchestrator.prototype._emitTaskDone = function(task, message, err) {
  if (!task.args) {
    task.args = {task: task.name};
  }
  task.args.duration = task.duration;
  task.args.hrDuration = task.hrDuration;
  task.args.message = task.name + ' ' + message;
  var evt = 'stop';
  if (err) {
    task.args.err = err;
    evt = 'err';
  }
  this.emit('task_' + evt, task.args);
};
Orchestrator.prototype._runTask = function(task) {
  var that = this;
  task.args = {
    task: task.name,
    message: task.name + ' started'
  };
  this.emit('task_start', task.args);
  task.running = true;
  runTask(task.fn.bind(this), function(err, meta) {
    that._stopTask.call(that, task, meta);
    that._emitTaskDone.call(that, task, meta.runMethod, err);
    if (err) {
      return that.stop.call(that, err);
    }
    that._runStep.call(that);
  });
};
var events = ['start', 'stop', 'err', 'task_start', 'task_stop', 'task_err', 'task_not_found', 'task_recursion'];
var listenToEvent = function(target, event, callback) {
  target.on(event, function(e) {
    e.src = event;
    callback(e);
  });
};
Orchestrator.prototype.onAll = function(callback) {
  var i;
  if (typeof callback !== 'function') {
    throw new Error('No callback specified');
  }
  for (i = 0; i < events.length; i++) {
    listenToEvent(this, events[i], callback);
  }
};
module.exports = Orchestrator;
