/* */ 
(function(process) {
  'use strict';
  var gutil = require('gulp-util');
  var prettyTime = require('pretty-hrtime');
  var chalk = require('chalk');
  var semver = require('semver');
  var archy = require('archy');
  var Liftoff = require('liftoff');
  var tildify = require('tildify');
  var interpret = require('interpret');
  var v8flags = require('v8flags');
  var completion = require('../lib/completion');
  var argv = require('minimist')(process.argv.slice(2));
  var taskTree = require('../lib/taskTree');
  process.env.INIT_CWD = process.cwd();
  var cli = new Liftoff({
    name: 'gulp',
    completions: completion,
    extensions: interpret.jsVariants,
    v8flags: v8flags
  });
  var failed = false;
  process.once('exit', function(code) {
    if (code === 0 && failed) {
      process.exit(1);
    }
  });
  var cliPackage = require('../package.json!systemjs-json');
  var versionFlag = argv.v || argv.version;
  var tasksFlag = argv.T || argv.tasks;
  var tasks = argv._;
  var toRun = tasks.length ? tasks : ['default'];
  var simpleTasksFlag = argv['tasks-simple'];
  var shouldLog = !argv.silent && !simpleTasksFlag;
  if (!shouldLog) {
    gutil.log = function() {};
  }
  cli.on('require', function(name) {
    gutil.log('Requiring external module', chalk.magenta(name));
  });
  cli.on('requireFail', function(name) {
    gutil.log(chalk.red('Failed to load external module'), chalk.magenta(name));
  });
  cli.on('respawn', function(flags, child) {
    var nodeFlags = chalk.magenta(flags.join(', '));
    var pid = chalk.magenta(child.pid);
    gutil.log('Node flags detected:', nodeFlags);
    gutil.log('Respawned to PID:', pid);
  });
  cli.launch({
    cwd: argv.cwd,
    configPath: argv.gulpfile,
    require: argv.require,
    completion: argv.completion
  }, handleArguments);
  function handleArguments(env) {
    if (versionFlag && tasks.length === 0) {
      gutil.log('CLI version', cliPackage.version);
      if (env.modulePackage && typeof env.modulePackage.version !== 'undefined') {
        gutil.log('Local version', env.modulePackage.version);
      }
      process.exit(0);
    }
    if (!env.modulePath) {
      gutil.log(chalk.red('Local gulp not found in'), chalk.magenta(tildify(env.cwd)));
      gutil.log(chalk.red('Try running: npm install gulp'));
      process.exit(1);
    }
    if (!env.configPath) {
      gutil.log(chalk.red('No gulpfile found'));
      process.exit(1);
    }
    if (semver.gt(cliPackage.version, env.modulePackage.version)) {
      gutil.log(chalk.red('Warning: gulp version mismatch:'));
      gutil.log(chalk.red('Global gulp is', cliPackage.version));
      gutil.log(chalk.red('Local gulp is', env.modulePackage.version));
    }
    if (process.cwd() !== env.cwd) {
      process.chdir(env.cwd);
      gutil.log('Working directory changed to', chalk.magenta(tildify(env.cwd)));
    }
    require(env.configPath);
    gutil.log('Using gulpfile', chalk.magenta(tildify(env.configPath)));
    var gulpInst = require(env.modulePath);
    logEvents(gulpInst);
    process.nextTick(function() {
      if (simpleTasksFlag) {
        return logTasksSimple(env, gulpInst);
      }
      if (tasksFlag) {
        return logTasks(env, gulpInst);
      }
      gulpInst.start.apply(gulpInst, toRun);
    });
  }
  function logTasks(env, localGulp) {
    var tree = taskTree(localGulp.tasks);
    tree.label = 'Tasks for ' + chalk.magenta(tildify(env.configPath));
    archy(tree).split('\n').forEach(function(v) {
      if (v.trim().length === 0) {
        return;
      }
      gutil.log(v);
    });
  }
  function logTasksSimple(env, localGulp) {
    console.log(Object.keys(localGulp.tasks).join('\n').trim());
  }
  function formatError(e) {
    if (!e.err) {
      return e.message;
    }
    if (typeof e.err.showStack === 'boolean') {
      return e.err.toString();
    }
    if (e.err.stack) {
      return e.err.stack;
    }
    return new Error(String(e.err)).stack;
  }
  function logEvents(gulpInst) {
    gulpInst.on('err', function() {
      failed = true;
    });
    gulpInst.on('task_start', function(e) {
      gutil.log('Starting', '\'' + chalk.cyan(e.task) + '\'...');
    });
    gulpInst.on('task_stop', function(e) {
      var time = prettyTime(e.hrDuration);
      gutil.log('Finished', '\'' + chalk.cyan(e.task) + '\'', 'after', chalk.magenta(time));
    });
    gulpInst.on('task_err', function(e) {
      var msg = formatError(e);
      var time = prettyTime(e.hrDuration);
      gutil.log('\'' + chalk.cyan(e.task) + '\'', chalk.red('errored after'), chalk.magenta(time));
      gutil.log(msg);
    });
    gulpInst.on('task_not_found', function(err) {
      gutil.log(chalk.red('Task \'' + err.task + '\' is not in your gulpfile'));
      gutil.log('Please check the documentation for proper gulpfile formatting');
      process.exit(1);
    });
  }
})(require('process'));
