/* */ 
(function(process) {
  'use strict';
  var LIBRARY = require('./_library'),
      global = require('./_global'),
      ctx = require('./_ctx'),
      classof = require('./_classof'),
      $export = require('./_export'),
      isObject = require('./_is-object'),
      aFunction = require('./_a-function'),
      anInstance = require('./_an-instance'),
      forOf = require('./_for-of'),
      speciesConstructor = require('./_species-constructor'),
      task = require('./_task').set,
      microtask = require('./_microtask')(),
      PROMISE = 'Promise',
      TypeError = global.TypeError,
      process = global.process,
      $Promise = global[PROMISE],
      process = global.process,
      isNode = classof(process) == 'process',
      empty = function() {},
      Internal,
      GenericPromiseCapability,
      Wrapper;
  var USE_NATIVE = !!function() {
    try {
      var promise = $Promise.resolve(1),
          FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec) {
            exec(empty, empty);
          };
      return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
    } catch (e) {}
  }();
  var sameConstructor = function(a, b) {
    return a === b || a === $Promise && b === Wrapper;
  };
  var isThenable = function(it) {
    var then;
    return isObject(it) && typeof(then = it.then) == 'function' ? then : false;
  };
  var newPromiseCapability = function(C) {
    return sameConstructor($Promise, C) ? new PromiseCapability(C) : new GenericPromiseCapability(C);
  };
  var PromiseCapability = GenericPromiseCapability = function(C) {
    var resolve,
        reject;
    this.promise = new C(function($$resolve, $$reject) {
      if (resolve !== undefined || reject !== undefined)
        throw TypeError('Bad Promise constructor');
      resolve = $$resolve;
      reject = $$reject;
    });
    this.resolve = aFunction(resolve);
    this.reject = aFunction(reject);
  };
  var perform = function(exec) {
    try {
      exec();
    } catch (e) {
      return {error: e};
    }
  };
  var notify = function(promise, isReject) {
    if (promise._n)
      return;
    promise._n = true;
    var chain = promise._c;
    microtask(function() {
      var value = promise._v,
          ok = promise._s == 1,
          i = 0;
      var run = function(reaction) {
        var handler = ok ? reaction.ok : reaction.fail,
            resolve = reaction.resolve,
            reject = reaction.reject,
            domain = reaction.domain,
            result,
            then;
        try {
          if (handler) {
            if (!ok) {
              if (promise._h == 2)
                onHandleUnhandled(promise);
              promise._h = 1;
            }
            if (handler === true)
              result = value;
            else {
              if (domain)
                domain.enter();
              result = handler(value);
              if (domain)
                domain.exit();
            }
            if (result === reaction.promise) {
              reject(TypeError('Promise-chain cycle'));
            } else if (then = isThenable(result)) {
              then.call(result, resolve, reject);
            } else
              resolve(result);
          } else
            reject(value);
        } catch (e) {
          reject(e);
        }
      };
      while (chain.length > i)
        run(chain[i++]);
      promise._c = [];
      promise._n = false;
      if (isReject && !promise._h)
        onUnhandled(promise);
    });
  };
  var onUnhandled = function(promise) {
    task.call(global, function() {
      var value = promise._v,
          abrupt,
          handler,
          console;
      if (isUnhandled(promise)) {
        abrupt = perform(function() {
          if (isNode) {
            process.emit('unhandledRejection', value, promise);
          } else if (handler = global.onunhandledrejection) {
            handler({
              promise: promise,
              reason: value
            });
          } else if ((console = global.console) && console.error) {
            console.error('Unhandled promise rejection', value);
          }
        });
        promise._h = isNode || isUnhandled(promise) ? 2 : 1;
      }
      promise._a = undefined;
      if (abrupt)
        throw abrupt.error;
    });
  };
  var isUnhandled = function(promise) {
    if (promise._h == 1)
      return false;
    var chain = promise._a || promise._c,
        i = 0,
        reaction;
    while (chain.length > i) {
      reaction = chain[i++];
      if (reaction.fail || !isUnhandled(reaction.promise))
        return false;
    }
    return true;
  };
  var onHandleUnhandled = function(promise) {
    task.call(global, function() {
      var handler;
      if (isNode) {
        process.emit('rejectionHandled', promise);
      } else if (handler = global.onrejectionhandled) {
        handler({
          promise: promise,
          reason: promise._v
        });
      }
    });
  };
  var $reject = function(value) {
    var promise = this;
    if (promise._d)
      return;
    promise._d = true;
    promise = promise._w || promise;
    promise._v = value;
    promise._s = 2;
    if (!promise._a)
      promise._a = promise._c.slice();
    notify(promise, true);
  };
  var $resolve = function(value) {
    var promise = this,
        then;
    if (promise._d)
      return;
    promise._d = true;
    promise = promise._w || promise;
    try {
      if (promise === value)
        throw TypeError("Promise can't be resolved itself");
      if (then = isThenable(value)) {
        microtask(function() {
          var wrapper = {
            _w: promise,
            _d: false
          };
          try {
            then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
          } catch (e) {
            $reject.call(wrapper, e);
          }
        });
      } else {
        promise._v = value;
        promise._s = 1;
        notify(promise, false);
      }
    } catch (e) {
      $reject.call({
        _w: promise,
        _d: false
      }, e);
    }
  };
  if (!USE_NATIVE) {
    $Promise = function Promise(executor) {
      anInstance(this, $Promise, PROMISE, '_h');
      aFunction(executor);
      Internal.call(this);
      try {
        executor(ctx($resolve, this, 1), ctx($reject, this, 1));
      } catch (err) {
        $reject.call(this, err);
      }
    };
    Internal = function Promise(executor) {
      this._c = [];
      this._a = undefined;
      this._s = 0;
      this._d = false;
      this._v = undefined;
      this._h = 0;
      this._n = false;
    };
    Internal.prototype = require('./_redefine-all')($Promise.prototype, {
      then: function then(onFulfilled, onRejected) {
        var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
        reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
        reaction.fail = typeof onRejected == 'function' && onRejected;
        reaction.domain = isNode ? process.domain : undefined;
        this._c.push(reaction);
        if (this._a)
          this._a.push(reaction);
        if (this._s)
          notify(this, false);
        return reaction.promise;
      },
      'catch': function(onRejected) {
        return this.then(undefined, onRejected);
      }
    });
    PromiseCapability = function() {
      var promise = new Internal;
      this.promise = promise;
      this.resolve = ctx($resolve, promise, 1);
      this.reject = ctx($reject, promise, 1);
    };
  }
  $export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
  require('./_set-to-string-tag')($Promise, PROMISE);
  require('./_set-species')(PROMISE);
  Wrapper = require('./_core')[PROMISE];
  $export($export.S + $export.F * !USE_NATIVE, PROMISE, {reject: function reject(r) {
      var capability = newPromiseCapability(this),
          $$reject = capability.reject;
      $$reject(r);
      return capability.promise;
    }});
  $export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {resolve: function resolve(x) {
      if (x instanceof $Promise && sameConstructor(x.constructor, this))
        return x;
      var capability = newPromiseCapability(this),
          $$resolve = capability.resolve;
      $$resolve(x);
      return capability.promise;
    }});
  $export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter) {
    $Promise.all(iter)['catch'](empty);
  })), PROMISE, {
    all: function all(iterable) {
      var C = this,
          capability = newPromiseCapability(C),
          resolve = capability.resolve,
          reject = capability.reject;
      var abrupt = perform(function() {
        var values = [],
            index = 0,
            remaining = 1;
        forOf(iterable, false, function(promise) {
          var $index = index++,
              alreadyCalled = false;
          values.push(undefined);
          remaining++;
          C.resolve(promise).then(function(value) {
            if (alreadyCalled)
              return;
            alreadyCalled = true;
            values[$index] = value;
            --remaining || resolve(values);
          }, reject);
        });
        --remaining || resolve(values);
      });
      if (abrupt)
        reject(abrupt.error);
      return capability.promise;
    },
    race: function race(iterable) {
      var C = this,
          capability = newPromiseCapability(C),
          reject = capability.reject;
      var abrupt = perform(function() {
        forOf(iterable, false, function(promise) {
          C.resolve(promise).then(capability.resolve, reject);
        });
      });
      if (abrupt)
        reject(abrupt.error);
      return capability.promise;
    }
  });
})(require('process'));
