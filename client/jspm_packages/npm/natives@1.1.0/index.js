/* */ 
(function(Buffer, process) {
  var natives = process.binding('natives');
  var module = require('module');
  var normalRequire = require;
  exports.source = src;
  exports.require = req;
  var vm = require('vm');
  var runInThisContext,
      ContextifyScript,
      Script;
  try {
    ContextifyScript = process.binding('contextify').ContextifyScript;
    runInThisContext = function runInThisContext(code, options) {
      var script = new ContextifyScript(code, options);
      return script.runInThisContext();
    };
  } catch (er) {
    Script = process.binding('evals').NodeScript;
    runInThisContext = Script.runInThisContext;
  }
  var wrap = ['(function (exports, require, module, __filename, __dirname) { ', '\n});'];
  function req(id, whitelist) {
    var cache = Object.create(null);
    if (Array.isArray(whitelist)) {
      whitelist.forEach(function(id) {
        cache[id] = {
          loading: false,
          loaded: true,
          filename: id + '.js',
          exports: require(id)
        };
      });
    }
    return req_(id, cache);
  }
  function req_(id, cache) {
    if (id === 'buffer') {
      return require('buffer');
    }
    if (id === 'native_module') {
      return {
        getSource: src,
        wrap: function(script) {
          return wrap[0] + script + wrap[1];
        },
        wrapper: wrap,
        _cache: cache
      };
    }
    var source = src(id);
    if (!source) {
      return undefined;
    }
    source = wrap[0] + source + wrap[1];
    var cachingRequire = function require(id) {
      if (cache[id]) {
        return cache[id].exports;
      }
      return req_(id, cache);
    };
    var nm = {
      exports: {},
      loading: true,
      loaded: false,
      filename: id + '.js'
    };
    cache[id] = nm;
    var fn;
    try {
      if (ContextifyScript) {
        fn = runInThisContext(source, {
          filename: nm.filename,
          lineOffset: 0,
          displayErrors: true
        });
      } else {
        fn = runInThisContext(source, nm.filename, true);
      }
      fn(nm.exports, cachingRequire, nm, nm.filename);
      nm.loaded = true;
    } finally {
      nm.loading = false;
    }
    return nm.exports;
  }
  function src(id) {
    return natives[id];
  }
})(require('buffer').Buffer, require('process'));
