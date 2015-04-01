(function(ENV){


/**
 * @preserve Neuron JavaScript Framework (c) Kael Zhang <i@kael.me>
 */

// Goal
// Manage module dependencies and initialization 

// Non-goal
// > What neuron will never do
// 1. Neuron will never care about non-browser environment
// 2. Neuron core will never care about module loading

'use strict';

var neuron = {
  version: '7.1.2'
};

var NULL = null;
var FALSE = !1;

var timestamp = + new Date;

// // Check and make sure the module is downloaded, 
// // if not, it will download the module
// neuron.load = function (module, callback){
//   callback();
// }

// Check and make sure the module is ready for running factory
// By default, 
// neuron core is only a module manager who doesn't care about module loading, 
// and consider all modules are already ready.
// By attaching `load.js` and `ready.js`, neuron will be an loader
neuron.ready = function (module, callback) {
  callback();
};


// ## ECMAScript5 implementation
//////////////////////////////////////////////////////////////////////

// - methods native object implemented
// - methods native object extends

// codes from mootools, MDC or by Kael Zhang

// ## Indexes

// ### Array.prototype
// - indexOf
// - lastIndexOf
// - filter
// - forEach
// - every
// - map
// - some
// - reduce
// - reduceRight

// ### Object
// - keys
// - create: removed

// ### String.prototype
// - trim
// - trimLeft
// - trimRight

// ## Specification

// ### STANDALONE language enhancement

// - always has no dependencies on Neuron
// - always follow ECMA standard strictly, including logic, exception type
// - throw the same error hint as webkit on a certain exception


function extend(host, methods) {
  for (var name in methods) {
    if (!host[name]) {
      host[name] = methods[name];
    }
  }
}


function implement(host, methods) {
  extend(host.prototype, methods);
}


var TYPE_ERROR = TypeError;


// ref: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array
implement(Array, {

  // Accessor methods ------------------------

  indexOf: function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || 0;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);

    if (from < 0) {
      from = Math.max(from + len, 0);
    }

    for (; from < len; from++) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  },

  lastIndexOf: function(value, from) {
    var len = this.length >>> 0;

    from = Number(from) || len - 1;
    from = Math[from < 0 ? 'ceil' : 'floor'](from);

    if (from < 0) {
      from += len;
    }

    from = Math.min(from, len - 1);

    for (; from >= 0; from--) {
      if (from in this && this[from] === value) {
        return from;
      }
    }

    return -1;
  },


  // Iteration methods -----------------------

  filter: function(fn, thisObject) {
    var ret = [];
    for (var i = 0, len = this.length; i < len; i++) {

      // Kael:
      // Some people might ask: "why we use a `i in this` here?".
      // ECMA:
      // > callback is invoked only for indexes of the array which have assigned values; 
      // > it is not invoked for indexes which have been deleted or which have never been assigned values

      // Besides, `filter` method is not always used with real Arrays, invocations below might happen:

      //     var obj = {length: 4}; obj[3] = 1;
      //     Array.prototype.filter.call({length: 4});
      //     Array.prototype.filter.call($('body'));

      // as well as the lines below
      if ((i in this) && fn.call(thisObject, this[i], i, this)) {
        ret.push(this[i]);
      }
    }

    return ret;
  },

  forEach: function(fn, thisObject) {
    for (var i = 0, len = this.length; i < len; i++) {
      if (i in this) {

        // if fn is not callable, it will throw
        fn.call(thisObject, this[i], i, this);
      }
    }
  },

  every: function(fn, thisObject) {
    for (var i = 0, len = this.length; i < len; i++) {
      if ((i in this) && !fn.call(thisObject, this[i], i, this)) {
        return false;
      }
    }
    return true;
  },

  map: function(fn, thisObject) {
    var ret = [],
      i = 0,
      l = this.length;

    for (; i < l; i++) {

      // if the subject of the index i is deleted, index i should not be contained in the result of array.map()
      if (i in this) {
        ret[i] = fn.call(thisObject, this[i], i, this);
      }
    }
    return ret;
  },

  some: function(fn, thisObject) {
    for (var i = 0, l = this.length; i < l; i++) {
      if ((i in this) && fn.call(thisObject, this[i], i, this)) {
        return true;
      }
    }
    return false;
  },

  reduce: function(fn) {
    if (typeof fn !== 'function') {
      throw new TYPE_ERROR(fn + ' is not an function');
    }

    var self = this,
      len = self.length >>> 0,
      i = 0,
      ret;

    if (arguments.length > 1) {
      ret = arguments[1];

    } else {
      do {
        if (i in self) {
          ret = self[i++];
          break;
        }

        // if array contains no values, no initial value to return
        if (++i >= len) {
          throw new TYPE_ERROR('Reduce of empty array with on initial value');
        }
      } while (true);
    }

    for (; i < len; i++) {
      if (i in self) {
        ret = fn.call(NULL, ret, self[i], i, self);
      }
    }

    return ret;
  },

  reduceRight: function(fn) {
    if (typeof fn !== 'function') {
      throw new TYPE_ERROR(fn + ' is not an function');
    }

    var self = this,
      len = self.length >>> 0,
      i = len - 1,
      ret;

    if (arguments.length > 1) {
      ret = arguments[1];

    } else {
      do {
        if (i in self) {
          ret = self[i--];
          break;
        }
        // if array contains no values, no initial value to return
        if (--i < 0) {
          throw new TYPE_ERROR('Reduce of empty array with on initial value');
        }

      } while (true);
    }

    for (; i >= 0; i--) {
      if (i in self) {
        ret = fn.call(NULL, ret, self[i], i, self);
      }
    }

    return ret;
  }

});


extend(Object, {

  // ~ https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create ~
  // create: function(o){
  //    if(o !== Object(o) && o !== NULL){
  //        throw new TYPE_ERROR('Object prototype may only be an Object or NULL');
  //    }

  //    function F() {}
  //    F.prototype = o;

  //    return new F();
  // },

  // refs:
  // http://ejohn.org/blog/ecmascript-5-objects-and-properties/
  // http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
  // https://developer.mozilla.org/en/ECMAScript_DontEnum_attribute
  // http://msdn.microsoft.com/en-us/library/adebfyya(v=vs.94).aspx
  keys: (function() {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      has_dontEnumBug = !{
        toString: ''
      }.propertyIsEnumerable('toString'),

      // In some old browsers, such as OLD IE, keys below might not be able to iterated with `for-in`,
      // even if each of them is one of current object's own properties  
      NONT_ENUMS = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],

      NONT_ENUMS_LENGTH = NONT_ENUMS.length;

    return function(o) {
      if (o !== Object(o)) {
        throw new TYPE_ERROR('Object.keys called on non-object');
      }

      var ret = [],
        name;

      for (name in o) {
        if (hasOwnProperty.call(o, name)) {
          ret.push(name);
        }
      }

      if (has_dontEnumBug) {
        for (var i = 0; i < NONT_ENUMS_LENGTH; i++) {
          if (hasOwnProperty.call(o, NONT_ENUMS[i])) {
            ret.push(NONT_ENUMS[i]);
          }
        }
      }

      return ret;
    };

  })()

  // for our current OOP pattern, we don't reply on Object based inheritance
  // so Neuron has not implemented the methods of Object such as Object.defineProperty, etc.
});


implement(String, {
  trimLeft: function() {
    return this.replace(/^\s+/, '');
  },

  trimRight: function() {
    return this.replace(/\s+$/, '');
  },

  trim: function() {
    return this.trimLeft().trimRight();
  }
});


// common code slice
//////////////////////////////////////////////////////////////////////
// - constants
// - common methods

// @const
// 'a@1.2.3/abc' -> 
// ['a@1.2.3/abc', 'a', '1.2.3', '/abc']

//                    0 1                2         3
var REGEX_PARSE_ID = /^((?:[^\/])+?)(?:@([^\/]+))?(\/.*)?$/;
// On android 2.2,
// `[^\/]+?` will fail to do the lazy match, but `(?:[^\/])+?` works.
// Shit, go to hell!

// Parses a module id into an object

// @param {string} id path-resolved module identifier
// 'a@1.0.0'    -> 'a@1.0.0'
// 'a'          -> 'a@*'
// 'a/inner'    -> 'a@*/inner'
function parse_module_id (id) {
  var match = id.match(REGEX_PARSE_ID);
  var name = match[1];

  // 'a/inner' -> 'a@latest/inner'
  var version = match[2] || '*';
  var path = match[3] || '';

  // There always be matches
  return format_parsed({
    n: name,
    v: version,
    p: path
  });
}


// Format package id and pkg
// `parsed` -> 'a@1.1.0'
function format_parsed(parsed) {
  var pkg = parsed.n + '@' + parsed.v;
  parsed.id = pkg + parsed.p;
  parsed.k = pkg;
  return parsed;
}


// Legacy
// Old neuron modules will not define a real resolved id.
// We determine the new version by `env.map`
// Since 6.2.0, actually, neuron will and should no longer add file extension arbitrarily,
// because `commonjs-walker@3.x` will do the require resolve during parsing stage.
// But old version of neuron did and will add a `config.ext` to the end of the file.
// So, if commonjs-walker does so, we adds a 
function legacy_transform_id (id, env) {
  return env.map
    ? id
    : id + '.js';
}


// A very simple `mix` method
// copy all properties in the supplier to the receiver
// @param {Object} receiver
// @param {Object} supplier
// @returns {mixed} receiver
function mix(receiver, supplier) {
  for (var c in supplier) {
    receiver[c] = supplier[c];
  }
}


// greedy match:
var REGEX_DIR_MATCHER = /.*(?=\/.*$)/;

// Get the current directory from the location
//
// http://jsperf.com/regex-vs-split/2
// vs: http://jsperf.com/regex-vs-split
function dirname(uri) {
  var m = uri.match(REGEX_DIR_MATCHER);

  // abc/def  -> abc
  // abc      -> abc  // which is different with `path.dirname` of node.js
  // abc/     -> abc
  return m ? m[0] : uri;
}


// Get the relative path to the root of the env
// @returns {string} a module path
function resolve_path (path, env) {
  // '', 'a.png' -> 'a.png'
  // '', './a.png' -> 'a.png'
  // '', '../a.png' -> '../a.png'
  // '/index.js', 'a.png' -> 'a.png'
  return path_join(
    // '' -> '' -> ''
    // '/index.js' -> '/' -> ''
    dirname(env.p).slice(1),
    path
  );
}


// Resolves an id according to env
// @returns {string} a module id
function resolve_id (path, env) {
  path = resolve_path(path, env);
  return path
    ? env.k + '/' + path
    : env.k;
}


// Canonicalize path
// The same as `path.resolve()` of node.js.

// For example:
// path_join('a', 'b')        -> 'a/b'
// path_join('a/b', './c')    -> 'a/b/c'
// path_join('a/b', '../c')   -> 'a/c'
// path_join('a//b', './c')   -> 'a/b/c'

// #75:
// path_join('../abc', './c') -> '../abc/c',

// path_join('', './c')       -> 'c'
// path_join('', '../c')      -> '../c' 
function path_join(from, to) {
  var parts = (from + '/' + to)
    .split('/')
    // Filter empty string:
    // ['', '.', 'c'] -> ['.', 'c']
    .filter(Boolean);
  return normalize_array(parts).join('/');
}


// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalize_array(parts) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  var i = parts.length - 1;
  for (; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);

    } else if (last === '..') {
      parts.splice(i, 1);
      up++;

    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  while (up--) {
    parts.unshift('..');
  }

  return parts;
}


// @param {string} path
function is_path_relative(path) {
  return path.indexOf('./') === 0 || path.indexOf('../') === 0;
}


// var REGEX_LEADING_SLASH = /^\//;
// function removes_leading_slash (str) {
//   return str.replace(REGEX_LEADING_SLASH, '');
// }


function err (message) {
  throw new Error('neuron: ' + message);
}


function module_not_found (id) {
  err("Cannot find module '" + id + "'");
}


// ## A very simple EventEmitter
//////////////////////////////////////////////////////////////////////

var events = {};

// @param {this} self
// @param {string} type
// @returns {Array.<function()>}
function get_event_storage_by_type(type) {
  return events[type] || (events[type] = []);
}


// Register an event once
function on(type, fn) {
  get_event_storage_by_type(type).push(fn);
}


// Emits an event
function emit(type, data) {
  var handlers = get_event_storage_by_type(type);
  handlers.forEach(function(handler) {
    handler(data);
  });
}


neuron.on = on;


// ## Neuron Core: Module Manager
//////////////////////////////////////////////////////////////////////

// ## CommonJS
// Neuron 3.x or newer is not the implementation of any CommonJs proposals
// but only [module/1.0](http://wiki.commonjs.org/wiki/Modules/1.0), one of the stable CommonJs standards.
// And by using neuron and [cortex](http://github.com/cortexjs/cortex), user could write module/1.0 modules.
// Just FORGET `define`.

// ## Naming Conventions of Variables
// All naming of variables should accord to this.

// Take `'a@1.0.0/relative'` for example:

// ### package 
// The package which the current module belongs to.
// - name or package name:  {string} package `name`: 'a'
// - package or package id: {string} contains package `name` and `version` and the splitter `'@'`. 
//   'a@1.0.0' for instance.

// ### module
// A package is consist of several module objects.
// - mod: {object} the module object. use `mod` instead of `module` to avoid confliction
// - id or module id: the descripter that contains package name, version, and path information
//      {string} for example, `'a@1.0.0/relative'` is a module id(entifier)

// ### version
// Package version: '1.0.0'

// ### main entry
// The module of a package that designed to be accessed from the outside

// ### shadow module and module
// A single module may have different contexts and runtime results
// - mod: the original module definition, including factory function, dependencies and so on
// - module: the shadow module, which is inherited from `mod`

////////////////////////////////////////////////////////////////////////////////////////////////


// Parse an id within an environment, and do range mapping, resolving, applying aliases.
// Returns {Object} parsed object
// @param {string} id
// @param {Object=} env the environment module
function parse_id(id, env) {
  // commonjs parser could not parse non-literal argument of `require`
  id || err('null id');

  env || (env = {});
  // {
  //   alias: {
  //     // id -> path
  //     './a' -> './a.js'
  //   }
  // }
  var map = env.map || {};
  id = map[id] || id;

  // Two kinds of id:
  // - relative module path
  // - package name
  // - a module with path loaded by facade or _use
  var parsed;
  var relative = is_path_relative(id);

  // `env` exists, which means the module is accessed by requiring within another module.
  // `id` is something like '../abc'
  if (relative) {
    env.id || module_not_found(id);

    id = resolve_id(id, env);

    // Legacy
    // If >= 6.2.0, there is always a map,
    // and a value of map is always a top level module id.
    // So, only if it is old wrappings, it would come here.
    // Besides, if not a relative id, we should not adds `'.js'` even it is an old wrapping.
    // How ever, we pass `env` to have a double check.
    id = legacy_transform_id(id, env);

    parsed = parse_module_id(id);

  // `id` is something like 'jquery'
  } else {
    // 1. id is a package name
    // 'jquery' -> 'jquery@~1.9.3'
    // 2. id may be is a package id
    // 'jquery@^1.9.3' -> 'jquery@^1.9.3'
    id = env.m && env.m[id] || id;
    // 'jquery' -> {n: 'jquery', v: '*', p: ''}
    // 'jquery@~1.9.3' -> {n: 'jquery', v: '~1.9.3', p: ''}
    parsed = parse_module_id(id);
  }

  
  if (parsed.k === env.k) {
    // if inside the same package of the parent module,
    // it uses a same sub graph of the package
    parsed.graph = env.graph;

  } else {
    // We route a package of certain range to a specific version according to `config.graph`
    // so several modules may point to a same exports
    // if is foreign module, we should parses the graph to the the sub graph
    var sub_graph = get_sub_graph(parsed.k, env.graph) 
      // If sub_graph not found, set it as `[]`
      || [];
    parsed.graph = sub_graph;
    parsed.v = sub_graph[0] || parsed.v;
    format_parsed(parsed);
  }

  return parsed;
}


function get_sub_graph (pkg, graph) {
  var global_graph = NEURON_CONF.graph._;
  var deps = graph
    ? graph[1]
    // If `graph` is undefined, fallback to global_graph
    : global_graph;
  return deps && (pkg in deps)
    // `deps[pkg]` is the graph id for the subtle graph
    ? NEURON_CONF.graph[deps[pkg]]
    : global_graph;
}


// Get the exports
// @param {Object} module
function get_exports(module) {
  // Since 6.0.0, neuron will not emit a "cyclic" event.
  // But, detecing static cyclic dependencies is a piece of cake for compilers, 
  // such as [cortex](http://github.com/cortexjs/cortex)
  return module.loaded
    ? module.exports

    // #82: since 4.5.0, a module only initialize factory functions when `require()`d.
    : generate_exports(module);
}


// Generate the exports of the module
function generate_exports (module) {
  // # 85
  // Before module factory being invoked, mark the module as `loaded`
  // so we will not execute the factory function again.
  
  // `mod.loaded` indicates that a module has already been `require()`d
  // When there are cyclic dependencies, neuron will not fail.
  module.loaded = true;

  // During the execution of factory, 
  // the reference of `module.exports` might be changed.
  // But we still set the `module.exports` as `{}`, 
  // because the module might be `require()`d during the execution of factory 
  // if cyclic dependency occurs.
  var exports = module.exports = {};

  // TODO:
  // Calculate `filename` ahead of time
  var __filename
    // = module.filename 
    = module_id_to_absolute_url(module.id);
  var __dirname = dirname(__filename);

  // to keep the object mod away from the executing context of factory,
  // use `factory` instead `mod.factory`,
  // preventing user from fetching runtime data by 'this'
  var factory = module.factory;
  factory(create_require(module), exports, module, __filename, __dirname);
  return module.exports;
}


var guid = 1;

// Get a shadow module or create a new one if not exists
// facade({ entry: 'a' })
function get_module (id, env, strict) {
  var parsed = parse_id(id, env);
  var graph = parsed.graph;
  var mod = get_mod(parsed);

  var real_id = mod.main
    // if is main module, then use `pkg` as `real_id`
    ? parsed.k
    : parsed.id;

  // `graph` is the list of modules for a certain package
  var module = graph[real_id];

  if (!module) {
    !strict || module_not_found(id);
    // So that `module` could be linked with a unique graph
    module = graph[real_id] = create_shadow_module(mod);
    module.graph = graph;

    // guid
    module.g || (module.g = guid ++);
  }

  return module;
}


// @param {Object} module
// @param {function(exports)} callback
function use_module (module, callback) {
  neuron.ready(module, function () {
    callback(get_exports(module));
  });
}


// Create a mod
function get_mod(parsed) {
  var id = parsed.id;
  return mods[id] || (mods[id] = {
    // package name: 'a'
    n: parsed.n,
    // package version: '1.1.0'
    v: parsed.v,
    // module path: '/b'
    p: parsed.p,
    // module id: 'a@1.1.0/b'
    id: id,
    // package id: 'a@1.1.0'
    k: parsed.k,
    // version map of the current module
    m: {},
    // loading queue
    l: [],
    // If no path, it must be a main entry.
    // Actually, it actually won't happen when defining a module
    main: !parsed.p
    // map: {Object} The map of aliases to real module id
  });
}


// @param {Object} mod Defined data of mod
function create_shadow_module (mod) {
  function F () {
    // callbacks
    this.r = [];
  }
  F.prototype = mod;
  return new F;
}


// Since 4.2.0, neuron would not allow to require an id with version
// TODO:
// for scoped packages
function test_require_id (id) {
  !~id.indexOf('@') || err("id with '@' is prohibited");
}


// use the sandbox to specify the environment for every id that required in the current module 
// @param {Object} env The object of the current module.
// @return {function}
function create_require(env) {
  var require = function(id) {
    // `require('a@0.0.0')` is prohibited.
    test_require_id(id);

    var module = get_module(id, env, true);
    return get_exports(module);
  };

  // @param {string} id Module identifier. 
  // Since 4.2.0, we only allow to asynchronously load a single module
  require.async = function(id, callback) {
    var origin = id;
    if (callback) {
      // `require.async('a@0.0.0')` is prohibited
      test_require_id(id);
      var relative = is_path_relative(id);
      if (relative) {
        id = resolve_id(id, env);
        var entries = env.entries;
        id = entries
          ? test_entries(id, entries) 
            || test_entries(id + '.js', entries) 
            || test_entries(id + '.json', entries)
            || module_not_found(origin)
          : legacy_transform_id(id, env);
      }

      var module = get_module(id, env);
      if (!module.main) {
        if (relative) {
          // If user try to load a non-entry module, it will get a 404 response
          module.a = true;
        } else {
          // We only allow to `require.async` main module or entries of the current package 
          return;
        }
      }

      use_module(module, callback);
    }
  };

  // @param {string} path
  // @returns
  // - {string} if valid
  // - otherwise `undefined`
  require.resolve = function (path) {
    // NO, you should not do this:
    // `require.resolve('jquery')`
    // We only allow to resolve a relative path

    // Trying to load the resources of a foreign package is evil.
    if (is_path_relative(path)) {
      path = resolve_path(path, env);

      // If user try to resolve a url outside the current package
      // it fails silently
      if (!~path.indexOf('../')) {
        return module_id_to_absolute_url(env.k + '/' + path);
      }
    }
  };

  return require;
}


function test_entries (path, entries) {
  return ~entries.indexOf(path)
    ? path
    : FALSE;
}


// ## Script Loader
//////////////////////////////////////////////////////////////////////

var DOC = document;

// never use `document.body` which might be NULL during downloading of the document.
var HEAD = DOC.getElementsByTagName('head')[0];

function load_js(src) {
  var node = DOC.createElement('script');

  node.src = src;
  node.async = true;

  js_onload(node, function() {
    HEAD.removeChild(node);
  });

  HEAD.insertBefore(node, HEAD.firstChild);
}


var js_onload = DOC.createElement('script').readyState
  // @param {DOMElement} node
  // @param {!function()} callback asset.js makes sure callback is not NULL
  ? function(node, callback) {
    node.onreadystatechange = function() {
      var rs = node.readyState;
      if (rs === 'loaded' || rs === 'complete') {
        node.onreadystatechange = NULL;
        callback.call(this);
      }
    };
  }

  : function(node, callback) {
    node.addEventListener('load', callback, false);
  };
  

// module define
// ---------------------------------------------------------------------------------------------------


// Method to define a module.

// **NOTICE** that `define` has no fault tolerance and type checking since neuron 2.0,
// because `define` method is no longer designed for human developers to use directly.
// `define` should be generated by some develop environment such as [cortex](http://github.com/cortexjs/cortex)
// @private

// @param {string} id (optional) module identifier
// @param {Array.<string>} dependencies ATTENSION! `dependencies` must be array of standard 
//   module id and there will be NO fault tolerance for argument `dependencies`. Be carefull!
// @param {function(...[*])} factory (require, exports, module)
// @param {Object=} options

// @return {undefined}
function define(id, dependencies, factory, options) {
  (options) || (options = {});

  var parsed = parse_id(id);
  if (parsed.p) {
    // Legacy
    // in old times, main entry: 
    // - define(id_without_ext)
    // - define(pkg) <- even older
    // now, main entry: define(id_with_ext)
    parsed.p = legacy_transform_id(parsed.p, options);
    format_parsed(parsed);
  }
  
  var pkg = parsed.k;
  var modMain;
  if (options.main) {
    modMain = mods[pkg];
  }

  // `mod['a@1.1.0']` must be USED before `mod['a@1.1.0/index.js']`,
  // because nobody knows which module is the main entry of 'a@1.1.0'
  // But `mod['a@1.1.0/index.js']` might be DEFINED first.
  var mod = mods[parsed.id] = modMain || mods[parsed.id] || get_mod(parsed);
  if (options.main) {
    mods[pkg] = mod;
    // Set the real id and path
    mix(mod, parsed);
  }
  mix(mod, options);

  // A single module might be defined more than once.
  // use this trick to prevent module redefining, avoiding the subsequent side effect.
  // mod.factory        -> already defined
  // X mod.exports  -> the module initialization is done
  if (!mod.factory) {
    mod.factory = factory;
    mod.deps = dependencies;
    // ['a@0.0.1']  -> {'a' -> 'a@0.0.1'}
    generate_module_version_map(dependencies, mod.m);

    var asyncDeps = options.asyncDeps;
    if (asyncDeps) {
      generate_module_version_map(asyncDeps, mod.m);
    }

    run_callbacks(mod, 'l');
  }
}


// @private
// create version info of the dependencies of current module into current sandbox
// @param {Array.<string>} modules no type detecting
// @param {Object} host

// ['a@~0.1.0', 'b@~2.3.9']
// -> 
// {
//     a: '~0.1.0',
//     b: '~2.3.9'
// }
function generate_module_version_map(modules, host) {
  modules.forEach(function(mod) {
    var name = mod.split('@')[0];
    host[name] = mod;
  });
}


// Run the callbacks
function run_callbacks (object, key) {
  var callbacks = object[key];
  var callback;
  // Mark the module is ready
  // `delete module.c` is not safe
  // #135
  // Android 2.2 might treat `null` as [object Global] and equal it to true,
  // So, never confuse `null` and `false`
  object[key] = FALSE;
  while(callback = callbacks.pop()){
    callback();
  }
}


// The logic to load the javascript file of a package
//////////////////////////////////////////////////////////////////////


function load_module (module, callback) {
  var mod = mods[module.id];
  mod.f = module.f;
  mod.a = module.a;
  var callbacks = mod.l;
  if (callbacks) {
    callbacks.push(callback);
    if (callbacks.length < 2) {
      load_by_module(mod);
    }
  }
}


// Scenarios:
// 1. facade('a/path');
// -> load a/path -> always
// 2. facade('a');
// -> load a.main
// 3. require('a');
// -> deps on a
// 4. require('./path')
// -> deps on a
// 5. require.async('a')
// -> load a.main -> 
// 6. require.async('./path')
// -> load a/path
// 7. require.async('b/path'): the entry of a foreign module
// -> forbidden

var pkgs = [];

// Load the script file of a module into the current document
// @param {string} id module identifier
function load_by_module(mod) {
  if (mod.d) {
    return;
  }

  // (D)ownloaded
  // flag to mark the status that a module has already been downloaded
  mod.d = true;

  var isFacade = mod.f;
  var isAsync = mod.a;
  var pkg = mod.k;

  // if one of the current package's entries has already been loaded,
  // and if the current module is not an entry(facade or async)
  if (~pkgs.indexOf(pkg)) {
    if (!isFacade && !isAsync) {
      return;
    }
  } else {
    pkgs.push(pkg);
  }

  var loaded = NEURON_CONF.loaded;
  // is facade ?
  var evidence = isFacade
    // if a facade is loaded, we will push `mod.id` of the facade instead of package id
    // into `loaded`
    ? mod.id
    : pkg;

  if (~loaded.indexOf(evidence)) {
    if (!isAsync) {
      // If the main entrance of the package is already loaded 
      // and the current module is not an async module, skip loading.
      // see: declaration of `require.async`
      return;
    }

    // load packages
  } else {
    loaded.push(evidence);
  }

  load_js(module_to_absolute_url(mod));
}


function module_to_absolute_url(mod) {
  var id = mod.main
    // if is a main module, we will load the source file by package

    // 1.
    // on use: 'a@1.0.0' (async or sync)
    // -> 'a/1.0.0/a.js'

    // 2.
    // on use: 'a@1.0.0/relative' (sync)
    // -> not an async module, so the module is already packaged inside:
    // -> 'a/1.0.0/a.js'
    ? mod.k + '/' + mod.n + '.js'

    // if is an async module, we will load the source file by module id
    : mod.id;

  return module_id_to_absolute_url(id);
}


// server: 'http://localhost/abc',
// -> http://localhost/abc/<relative>
// @param {string} relative relative module url
function module_id_to_absolute_url(id) {
  var pathname = id.replace('@', '/');
  var base = NEURON_CONF.path;
  base || err('config.path must be specified');
  base = base.replace('{n}', pathname.length % 3 + 1);

  pathname += NEURON_CONF.cache === false
    ? '?f=' + timestamp
    : '';

  return base + pathname;
}


// ## Graph Isomorphism and Dependency resolving
//////////////////////////////////////////////////////////////////////

// ### module.defined <==> module.factory
// Indicates that a module is defined, but its dependencies might not defined. 

// ### module.ready
// Indicates that a module is ready to be `require()`d which may occurs in two cases
// - A module is defined but has no dependencies
// - A module is defined, and its dependencies are defined, ready or loaded

// ### module.loaded
// Indicates that module.exports has already been generated

// Register the ready callback for a module, and recursively prepares
// @param {Object} module
// @param {function()} callback
// @param {Array=} stack
function ready (module, callback, stack) {
  emit('beforeready', module_id(module) + ':' + module.g);

  if (!module.factory) {
    emit('beforeload', module.id);
    return load_module(module, function () {
      emit('load', module_id(module));
      ready(module, callback, stack);
    });
  }

  var deps = module.deps;
  var counter = deps.length;

  var callbacks = module.r;
  // `module.r` is `[]` in origin.
  // `!callbacks` means the module is ready
  if (!counter || !callbacks) {
    module.r = FALSE;
    emit_ready(module);
    return callback();
  }

  callbacks.push(callback);
  // if already registered, skip checking
  if (callbacks.length > 1) {
    return;
  }

  var cb = function () {
    if (!-- counter) {
      stack.length = 0;
      stack = NULL;
      emit_ready(module);
      run_callbacks(module, 'r');
    }
  };

  stack = stack
    ? [module].concat(stack)
    : [module];

  deps.forEach(function (dep) {
    var child = get_module(dep, module);
    // If the child is already in the stack,
    // which means there might be cyclic dependency, skip it.
    if (~stack.indexOf(child)) {
      return cb();
    }
    ready(child, cb, stack);
  });
}


function emit_ready (module) {
  emit('ready', module_id(module) + ':' + module.g);
}


function module_id (module) {
  return module.main ? module.k : module.id;
}

// @override
neuron.ready = ready;



// Manage configurations
//////////////////////////////////////////////////////////////////////

// var neuron_loaded = [];
var NEURON_CONF = neuron.conf = {
  loaded: [],
  // If `config.tree` is not specified, 
  graph: {
    _: {}
  }
};


var SETTERS = {

  // The server where loader will fetch modules from
  // if use `'localhost'` as `base`, switch on debug mode
  'path': function(path) {
    // Make sure 
    // - there's one and only one slash at the end
    // - `conf.path` is a directory 
    return path.replace(/\/*$/, '/');
  },

  'loaded': justReturn,
  'graph': justReturn,
  'cache': justReturn
};


function justReturn(subject) {
  return subject;
}


function config(conf) {
  var key;
  var setter;
  for (key in conf) {
    setter = SETTERS[key];
    if (setter) {
      NEURON_CONF[key] = setter(conf[key]);
    }
  }
}

neuron.config = config;


// ## Explode public methods
//////////////////////////////////////////////////////////////////////

ENV.neuron = neuron;

// @expose
ENV.define = define;

// @expose
// Attach a module for business facade, for configurations of inline scripts
// if you want a certain biz module to be initialized automatically, the module's exports should contain a method named 'init'
// ### Usage 
// ```
// // require biz modules with configs
// facade({
//   entry: 'app-main-header-bar',
//   data: {
//     icon: 'http://kael.me/u/2012-03/icon.png'
//   }
// });
//  ```
ENV.facade = function (item) {
  use_module_by_id(item.entry, function(method) {
    method.init && method.init(item.data);
  });
};


// private methods only for testing
// avoid using this method in product environment
// @expose
ENV._use = function (id, callback) {
  use_module_by_id(id, callback);
};

// @expose
ENV._load = load_js;


function use_module_by_id (id, callback) {
  var module = get_module(id);
  module.f = true;
  use_module(module, callback);
}



// map of id -> defined module data
var mods = neuron.mods = {};



// Use `this`, and never cares about the environment.
})(this);
neuron.config({
  "graph": {
    "0": [
      "1.0.1"
    ],
    "_": {
      "dpapp@1.0.1": 0,
      "dpapp@*": 0
    }
  }
});neuron.config({path:"http://i{n}.dpfile.com/mod/"});(function(){
function mix(a,b){for(var k in b){a[k]=b[k];}return a;}
var _0 = "dpapp@1.0.1/lib/native-core.js";
var _1 = "dpapp@1.0.1/lib/patch-7.1.js";
var _2 = "dpapp@1.0.1/lib/patch-7.0.js";
var _3 = "dpapp@1.0.1/lib/patch-6.x.js";
var _4 = "dpapp@1.0.1/lib/web.js";
var _5 = "dpapp@1.0.1/lib/core.js";
var _6 = "dpapp@1.0.1/lib/queue.js";
var _7 = "dpapp@1.0.1/index.js";
var asyncDepsToMix = {};
var globalMap = asyncDepsToMix;
define(_7, [_0,_1,_2,_3,_4], function(require, exports, module, __filename, __dirname) {
(function (Host) {
  var Efte;
  var version;
  var userAgent = Host.navigator.userAgent;

  // Require different platform js base on userAgent.
  // Native part will inject the userAgent with string `efte`.

  function getQuery(){
    var query = location.search.slice(1);
    var ret = {};
    query.split("&").forEach(function(pair){
      var splited = pair.split("=");
      ret[splited[0]] = splited[1];
    });
    return ret;
  }

  var EfteNativeCore = require('./lib/native-core');
  if (EfteNativeCore._uaVersion == "7.1.x") {
    Efte = EfteNativeCore.extend(require('./lib/patch-7.1'));
  } else if(EfteNativeCore._uaVersion == "7.0.x"){
    // 目前有修改UA，而api尚未对齐的仅7.0版本
    Efte = EfteNativeCore.extend(require('./lib/patch-7.0'));
  } else{
    // 更早的7.0之前的古早版本
    if(getQuery().product == "dpapp"){
      Efte = EfteNativeCore.extend(require('./lib/patch-6.x'));
    }else{
    // 认为是在web中
      Efte = require('./lib/web');
    }
  }

  Efte.getQuery = getQuery;

  // Export Efte object, if support AMD, CMD, CommonJS.
  if (typeof module !== 'undefined') {
    module.exports = Efte;
  }

  // Export Efte object to Host
  if (typeof Host !== 'undefined') {
    Host.Efte = Host.DPApp = Efte;
  }
}(this));
}, {
    main:true,
    map:mix({"./lib/native-core":_0,"./lib/patch-7.1":_1,"./lib/patch-7.0":_2,"./lib/patch-6.x":_3,"./lib/web":_4},globalMap)
});

define(_0, [_5,_6], function(require, exports, module, __filename, __dirname) {
var Efte = module.exports = require('./core');
/**
 * count from 1
 * @type {Number}
 */
var callbacksCount = 1;
/**
 * mapping for all callbacks
 * @type {Object}
 */

var queue = require('./queue');
var q = queue(function(data){
  Efte._doSendMessage(data.method, data.args, data.callback);
});

Efte.extend({
  _callbacks: Efte._callbacks || {},
	_dequeueTimeout: null,
  dequeue: function(){
    clearTimeout(this._dequeueTimeout);
    this._dequeueTimeout = null;
    q.dequeue();
  },
  _sendMessage: function(method, args, callback){
    q.push({
      method: method,
      args: args,
      callback: callback
    });
    this._dequeueTimeout = setTimeout(this.dequeue.bind(this),1000);
  },
  /**
   * send message to native
   * @param  {String}   method
   * @param  {Object}   args
   * @param  {Function} callback
   */
  _doSendMessage: function (method, args, callback) {
      var hasCallback = callback && typeof callback == 'function';

      this.log('调用方法', method, args);

      /**
       * pass 0 as callbackId
       * thus _callbacks[callbackId] is undefined
       * nothing will happend
       * @type {Number}
       */
      var callbackId = hasCallback ? callbacksCount++ : 0;
      if (hasCallback){
        this._callbacks[callbackId] = callback;
      }

      /**
       * check type for args
       */
      if(!args || typeof args !== 'object'){
        args = {};
      }

      var oldProto = (this._uaVersion !== "7.1.x");
      if(oldProto){
        args.callbackId = callbackId;
      }

      args = JSON.stringify(args);

      this._createIframe('js://_?method=' + method + '&args=' + encodeURIComponent(args) + (oldProto ? '' : ('&callbackId=' + callbackId)));
  },
  _createIframe: function(src){
    /**
     * create iframe，
     * and native will intercept and handle the process
     */
    var ifr = document.createElement('iframe');
    ifr.style.display = 'none';
    document.body.appendChild(ifr);

    function removeIframe(){
      ifr.onload = ifr.onerror = null;
      ifr.parentNode && ifr.parentNode.removeChild(ifr);
    }
    /**
     * remove iframe after loaded
     */
    ifr.onload = ifr.onerror = removeIframe;
    setTimeout(removeIframe,5000);
    ifr.src = src;
  },
  _send: function(method, args){
    args = args || {};
    var self = this;
    var _success = args.success;
    var _fail = args.fail;
    var _handle = args.handle;

    var fail = function(result){
      self.log('调用失败', result);
      _fail && _fail.call(self, result);
    }

    var success = function(result){
      self.log('调用成功', result);
      _success && _success.call(self, result);
    }

    var handle = function(result){
      self.log('回调', result);
      _handle && _handle.call(self, result);
    }

    var callback = (_success || _fail || _handle) ? function(result){
      var status = result.status;
      if(result.result != "next"){
        delete result.result;
      }
      if(status == "success"){
        success && success(result);
      }else if(status == "action"){
        handle && handle(result);
      }else{
        fail && fail(result);
      }
    } : null;
    this._sendMessage(method, args, callback);
  },
  _sanitizeAjaxOpts: function(args){
    args.method = args.method || "get";
    args.data = args.data || "";
    var url = args.url;
    var data = args.data;

    if (args.method == "get") {
      var params = [];
      for (var p in data) {
        if (data[p]) {
          params.push(p + '=' + encodeURIComponent(data[p]));
        }
      }

      if (params.length) {
        url += url.indexOf('?') == -1 ? "?" : "&";
        url += params.join('&');
      }
      args.url = url;
      delete args.data;
    }
    return args;
  },
  _transModel: function(keys, obj){
    if(!keys){return obj;}
    var keymap = {};

    function getHash(str) {
      hashCode = function(str) {
        var hash = 0,
          i, chr, len;
        if (str.length == 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
          chr = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };

      var i = hashCode(str);
      return "0x" + ((0xFFFF & i) ^ (i >>> 16)).toString(16);
    }

    function generateKeys(keys) {
      keys.forEach(function(key) {
        keyMap[getHash(key)] = key;
      });
    }

    function isArray(val) {
      return Object.prototype.toString.call(val) == "[object Array]";
    }

    function isObject(val) {
      return Object.prototype.toString.call(val) == "[object Object]";
    }

    function translate(obj){
      if (isObject(obj)) {
        delete obj.__name;
        for (var key in obj) {
          var val;
          if (keymap[key]) {
            val = obj[keymap[key]] = obj[key];
            translate(val);
            delete obj[key];
          }
        }
      } else if (isArray(obj)) {
        obj.forEach(function(item) {
          translate(item);
        });
      }
      return obj;
    }

    keys.forEach(function(key) {
      keymap[getHash(key)] = key;
    });

    return translate(obj);
  },
  /**
   * callback function to be invoked from native
   * @param  {Number} callbackId
   * @param  {Object} retValue
   */
  callback: function(callbackId, retValue) {
    var callback = this._callbacks[callbackId];
    callback && callback.call(this,retValue);
    if(retValue.result == "complete" || retValue.result == "error"){
      this._callbacks[callbackId] = null;
      delete this._callbacks[callbackId];
    }
  },
});
}, {
    map:mix({"./core":_5,"./queue":_6},globalMap)
});

define(_1, [_2], function(require, exports, module, __filename, __dirname) {
var apis = [
  /**
   * Infos
   */
  "getUserInfo", "getCityId", "getLocation", "getContactList", "getCX",
  /**
   * Common
   */
  "getRequestId", "downloadImage", "closeWindow", /* getNetworkType, share */
  /**
   * Funcs
   */
  "sendSMS", "openScheme", /* ajax */
  /**
   * Broadcast
   */
  "publish", /* subscribe, unsubscribe, login */
  /**
   * UI
   */
  "setTitle", "setLLButton", "setLRButton", "setRLButton", "setRRButton"
];


var _events = {};
var patch7 = require('./patch-7.0');
var Patch = module.exports = {

ready : function(callback) {
  this._send("ready", {
    success: callback
  });
},
_iOSNetworkType: function (result) {
  var networkType;
  var types = {
    kSCNetworkReachabilityFlagsTransientConnection: 1 << 0,
    kSCNetworkReachabilityFlagsReachable: 1 << 1,
    kSCNetworkReachabilityFlagsConnectionRequired: 1 << 2,
    kSCNetworkReachabilityFlagsConnectionOnTraffic: 1 << 3,
    kSCNetworkReachabilityFlagsInterventionRequired: 1 << 4,
    kSCNetworkReachabilityFlagsConnectionOnDemand: 1 << 5,
    kSCNetworkReachabilityFlagsIsLocalAddress: 1 << 16,
    kSCNetworkReachabilityFlagsIsDirect: 1 << 17,
    kSCNetworkReachabilityFlagsIsWWAN: 1 << 18
  };
  var type = result.type;
  var subType = result.subType;
  var returnValue;
  // 2g, 3g, 4g
  function getMobileType(subType) {
    switch (subType) {
      case "CTRadioAccessTechnologyGPRS":
      case "CTRadioAccessTechnologyEdge":
      case "CTRadioAccessTechnologyCDMA1x":
        return "2g";
      case "CTRadioAccessTechnologyLTE":
        return "4g";
      case "CTRadioAccessTechnologyWCDMA":
      case "CTRadioAccessTechnologyHSDPA":
      case "CTRadioAccessTechnologyHSUPA":
      case "CTRadioAccessTechnologyCDMA1x":
      case "CTRadioAccessTechnologyCDMAEVDORev0":
      case "CTRadioAccessTechnologyCDMAEVDORevA":
      case "CTRadioAccessTechnologyCDMAEVDORevB":
      case "CTRadioAccessTechnologyeHRPD":
        return "3g";
    }
  }

  if ((type & types.kSCNetworkReachabilityFlagsReachable) == 0) {
    returnValue = "none";
  }

  if ((type & types.kSCNetworkReachabilityFlagsConnectionRequired) == 0) {
    // if target host is reachable and no connection is required
    //  then we'll assume (for now) that your on Wi-Fi
    returnValue = "wifi";
  }


  if (
    (type & types.kSCNetworkReachabilityFlagsConnectionOnDemand) != 0
    ||
    (type & types.kSCNetworkReachabilityFlagsConnectionOnTraffic) != 0
  ) {
    // ... and the connection is on-demand (or on-traffic) if the
    //     calling application is using the CFSocketStream or higher APIs
    if ((type & types.kSCNetworkReachabilityFlagsInterventionRequired) == 0) {
      // ... and no [user] intervention is needed
      returnValue = "wifi";
    }
  }

  if ((type & types.kSCNetworkReachabilityFlagsIsWWAN) == types.kSCNetworkReachabilityFlagsIsWWAN) {
    // ... but WWAN connections are OK if the calling application
    //     is using the CFNetwork (CFSocketStream?) APIs.
    returnValue = getMobileType(subType);
  }

  return returnValue;
},
_androidNetworkType: function (result) {
  var type = result.type;
  var subType = result.subType;

  if (type == 0) {
    switch (subType) {
      case 1:
      case 2:
      case 4:
      case 7:
      case 11:
        return "2g";
      case 3:
      case 5:
      case 6:
      case 8:
      case 9:
      case 10:
      case 12:
      case 14:
      case 15:
        return "3g";
      case 13:
        return "4g";
    }
  }

  if (type == 1) {
    return "wifi";
  } else {
    return "none";
  }
},
getNetworkType : function(opts) {
  var _success = opts.success;

  this._send("getNetworkType", {
    success: function(result) {
      var ua = this.getUA();
      var networkType;
      switch (ua.osName) {
        case "iphone":
          networkType = this._iOSNetworkType(result);
          break;
        case "android":
          networkType = this._androidNetworkType(result);
          break;
      }

      _success && _success({
        networkType: networkType,
        raw: {
          type: result.type,
          subType: result.subType
        }
      });
    },
    fail: opts.fail
  });
},

share : function(opts) {
  if (!opts.feed) {
    opts.feed = 0xff;
  } else if (opts.feed.constructor.toString().indexOf("Array") >= 0) {
    var feed = [0, 0, 0, 0, 0, 0, 0, 0];
    opts.feed.forEach(function(pos) {
      feed[7 - pos] = 1;
    });
    opts.feed = parseInt(feed.join(""), 2);
  }

  this._send("share", opts);
},

initShare: function(opt){
  var self = this;
  this.setRRButton({
    icon:"H5_Share",
    handle: function(){
      self.share({
        title: opt.title,
        desc: opt.desc,
        content: opt.content,
        image: opt.image,
        url: opt.url,
        success: opt.success,
        fail: opt.fail
      });
    }
  });
},

subscribe : function(opts) {
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  if (_events[name]) {
    opts.success && opts.success();
    _events[name].push(handle);
  } else {
    this._send("subscribe", {
      action: name,
      success: opts.success,
      handle: function() {
        _events[name].forEach(function(func) {
          func();
        });
      }
    });
    _events[name] = [handle];
  }
},

unsubscribe : function(opts) {
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  var index = _events[name] ? _events[name].indexOf(handle) : -1;
  if (index != -1) {
    _events[name].splice(index, 1);
    success && success();
  } else {
    this._send("unsubscribe", {
      action: name,
      success: success
    });
  }
},

pay : patch7.pay,

ajax : function(args) {
  args = this._sanitizeAjaxOpts(args);
  var _success = args.success;
  args.success = function(e) {
    var result = JSON.parse(e.mapiResult);
    result = this._transModel(args.keys, result);
    _success(result);
  };

  this._send("mapi", args);
},


uploadImage : function(opts){
  var success = opts.success;
  var fail = opts.fail;
  var handle = opts.handle;

  this._sendMessage("uploadImage", opts, function(result){
    var status = result.status;
    if(status == "fail"){
      fail && fail(result);
      return;
    }else{
      handle && handle(result);
    }
  });
},


login : function(opts) {
  var self = this;
  function getUser(callback) {
    self.getUserInfo({
      success: callback
    });
  }
  getUser(function(result) {
    if (result.token) {
      opts.success && opts.success(result);
    } else {
      var handler = function() {
        getUser(function(result) {
          opts.success && opts.success(result);
        });
        this.unsubscribe({
          "action": "loginSuccess",
          handle: handler
        });
      };
      this.subscribe({
        action: "loginSuccess",
        handle: handler
      });

      this.openScheme({
        url: "dianping://login"
      });
    }
  });
}

};


apis.forEach(function(name) {
  Patch[name] = function(options) {
    this._send(name, options);
  }
});


(function() {
  var uastr = navigator.userAgent;
  var appVersionMatch = uastr.match(/dp\/[\w\.\d]+\/([\d\.]+)/);
  appVersion = appVersionMatch && appVersionMatch[1];

  Patch.getUA = function(opt) {
    var result = {};
    var success = opt && opt.success;
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: this._osUA.name,
      osVersion: this._osUA.version
    };
    success && success(ua);
    return ua;
  };
})();
}, {
    map:mix({"./patch-7.0":_2},globalMap)
});

define(_2, [_5,_3], function(require, exports, module, __filename, __dirname) {
var core = require('./core');
var patch6 = require('./patch-6.x');
var Patch = module.exports = core._mixin(patch6, {
	getUA : function(opt){
		var result = {};
  	var success = opt && opt.success;
  	var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
  	var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: this._osUA.name,
      osVersion: this._osUA.version
    };
  	success && success(ua);
    return ua;
	},

  pay: function(args){
    var self = this;
    var payType = args.payType;
    var success = args.success;
    var fail = args.fail;
    var cx = args.cx;

    function payOrder(data, callback) {
      DPApp.ajax({
        url: 'http://api.p.dianping.com/payorder.pay',
        data: data,
        keys: ["Content"],
        success: function(paymsg) {
          callback(null, paymsg);
        },
        fail: function(fail) {
          callback("fail payorder");
        }
      });
    }

    function getPaymentTool(payType) {
      var PAY_TYPE_MINIALIPAY = 1;
      var PAY_TYPE_WEIXINPAY = 7;
      var PAYMENTTOOL_ALIPAY = "5:1:null#219#0";
      var PAYMENTTOOL_WEIXINPAY = "11:1:null#217#0";
      if (payType == PAY_TYPE_WEIXINPAY) {
        paymentTool = PAYMENTTOOL_WEIXINPAY;
      } else {
        paymentTool = PAYMENTTOOL_ALIPAY;
      }
      return paymentTool;
    }

    payOrder({
      token: args.token,
      orderid: args.orderId,
      paymenttool: getPaymentTool(payType),
      cx: cx
    }, function(err, paymsg) {
      if (err) {
        return fail && fail(err);
      }


      self._sendMessage('pay', {
        paytype: payType,
        paycontent: paymsg.Content
      }, function(data) {
        if (data.payresult) {
          success && success(data);
        } else {
          fail && fail(data);
        }
      });
    });
  },
  uploadImage : function(opts){
    var success = opts.success;
    var fail = opts.fail;
    var handle = opts.handle;

    this._sendMessage("uploadImage", opts, function(result){
      var status = result.status;
      if(status == "fail"){
        fail && fail(result);
        return;
      }else{
        handle && handle(result);
      }
    });
  },

  closeWindow : function(){
    this._sendMessage('close_web');
  }
});
}, {
    map:mix({"./core":_5,"./patch-6.x":_3},globalMap)
});

define(_3, [_5], function(require, exports, module, __filename, __dirname) {
var core = require('./core');
var NOOP = function() {};
var cachedEnv = {};
var callbackLists = {};

function dealCallback(key, value) {
  var list = callbackLists[key];
  if (list) {
    list.forEach(function(callback) {
      callback(value);
    });
    delete callbackLists[key];
  }
}

var Patch = module.exports = {

  _sendMessage : function(key, args, callback) {

    this._doSendMessage(key, args, callback);
  },

  _getEnv : function(callback) {
    this._sendMessage("getEnv", null, function(env){
      cachedEnv = env;
      callback.call(this, env);
    });
  },

  getUA : function(opt) {
    var success = opt && opt.success;
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: cachedEnv && cachedEnv.version,
      osName: Efte._osUA.name,
      osVersion: Efte._osUA.version
    };
    success && success(ua);
    return ua;
  },

  initShare: function(opt){
    var success = opt.success;
    var fail = opt.fail;
    var src = "dpshare://_?content=";
    src += encodeURIComponent(JSON.stringify({
      title: opt.title,
      desc: opt.desc,
      image: opt.image,
      url: opt.url
    }));
    this.shareCallback = function(result){
      if(result.status == "success"){
        success && success(result);
      }else{
        fail && fail(result);
      }
    };
    this._createIframe(src);
  },
  shareCallback: function(){
  },
  getCityId : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        cityId: result.cityid
      });
    });
  },

  getNetworkType : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        networkType: result.network
      });
    });
  },

  getUserInfo : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        token: result.token,
        dpid: result.dpid,
        userId: result.userId
      });
    });
  },

  getLocation : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        lat: result.latitude,
        lng: result.longitude
      });
    });
  },

  getCX : function(opt) {
    var business = opt.business;
    var success = opt.success;
    this._sendMessage('cx', {
      business: business
    }, success);
  },

  closeWindow : function() {
    this._sendMessage("close_web");
  },
  setTitle : function(opt) {
    document.title = opt.title;
    var success = opt.success;
    var title = opt.title;
    this._sendMessage("setTitle", {
      title: title
    }, function() {});
  },
  openScheme : function(opt){
    this._sendMessage('actionScheme', {url: opt.url});
  },
  ajax : function(opts) {
    opts = this._sanitizeAjaxOpts(opts);
    var self = this;
    var success = opts.success;
    var fail = opts.fail;
    function parseJSON(data){
      var ret = {};
      if (data && data.length > 0) {
        try {
          ret = JSON.parse(data);
        } catch (ignore) {}
      }
      return ret;
    }
    this._sendMessage("ajax", opts, function(data) {
      if (data.code == 0) {
        var result = this._mixin(
          parseJSON(data.responseText),
          this._transModel(opts.keys, parseJSON(data.hashJson))
        );
        success && success(result);
      } else {
        fail && fail({
          code: data.code,
          errMsg: data.message
        });
      }
    });
  },

  ready : function(callback){
    var self = this;
    this._getEnv(function(){
      callback.call(self);
    });
  },

  share : function(opts){
    if (!opts.feed) {
      opts.feed = 0xff;
    } else if (opts.feed.constructor.toString().indexOf("Array") >= 0) {
      var feed = [0, 0, 0, 0, 0, 0, 0, 0];
      opts.feed.forEach(function(pos) {
        feed[7 - pos] = 1;
      });
      opts.feed = parseInt(feed.join(""), 2);
    }

    this._sendMessage("share", opts);
  },

  isStatusOK : NOOP,
  did_handle_callback : NOOP
};

["subscribe","getRequestId","uploadImage","getContactList","unsubscribe","publish","setLLButton","setLRButton","setRLButton","setRRButton"].forEach(function(name){
  Patch[name] = core.notImplemented;
});
}, {
    map:mix({"./core":_5},globalMap)
});

define(_4, [_5], function(require, exports, module, __filename, __dirname) {
var Efte = require('./core');
var notImplemented = Efte._notImplemented;


/**
 * Common
 * 基础功能，所有app都会用到
 */
Efte.extend({
  getUA: function(opt){
    var success = opt && opt.success;
    var ua = {
      platform: "web",
      appName: null,
      appVersion: null,
      osName: Efte._osUA.name,
      osVersion: Efte._osUA.version
    };
    success && success(ua);
    return ua;
  },
  ready: function(callback) {
    document.addEventListener("DOMContentLoaded", function(event) {
      callback();
    });
  },
  ajax: function(opts) {
    var METHOD_GET = "GET";
    var url = opts.url;
    var method = (opts.method || METHOD_GET).toUpperCase();
    var headers = opts.headers || {};
    var data = opts.data;
    var success = opts.success;
    var fail = opts.fail;

    xhr = new XMLHttpRequest();

    if(!url){
      url = location.href.split("?")[0];
    }

    if(method === METHOD_GET && data){
      url += parseQuery(data);
      data = null;
    }

    if(method !== METHOD_GET){
      xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    }

    function parseQuery(data){
      var queryString = "";
      for(var key in data){
        queryString +=  key + '=' + encodeURIComponent(data[key])
      }
      return queryString;
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) { // ready
        xhr.onreadystatechange = function() {};
        var result, error = false;
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
          result = xhr.responseText;

          try {
            result = /^\s*$/.test(result) ? null : JSON.parse(result);
          } catch (e) {
            error = e;
          }

          if (error) fail && fail('ERR_PARSE_JSON');
          else success(result);
        } else {
          fail && fail(xhr.statusText);
        }
      }
    };

    xhr.open(opts.method, url, true, opts.username, opts.password);
    for(var name in headers){
      xhr.setRequestHeader(name, headers[name]);
    }
    xhr.send(data);
  },
  getRequestId: notImplemented,
  // ImagePicker: ImagePicker,
  uploadImage: function(){

  },
  downloadImage: notImplemented,
  closeWindow: function(){
    window.close();
  }
});

/**
 * Infos
 */
Efte.extend({
  getLocation: function(opts) {
    var success = opts.success;
    var fail = opts.fail;
    navigator.geolocation.getCurrentPosition(function(position){
      success && success({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    },function(){
      fail && fail("ERR_GET_LOCATION");
    });
  },
  // 无法完美实现就不实现
  getNetworkType: notImplemented,
  getCityId: notImplemented,
  getUserInfo: notImplemented,
  getContactList: notImplemented,
  getCX: notImplemented
});

/**
 * Funcs
 */
Efte.extend({
  pay: function(opts) {
    // 找文东
  },
  share: function(opts) {
    var success = opts.success;
    var handle = opts.handle;

    var title = opts.title;
    var desc = opts.desc;
    var content = opts.content;
    var pic = opts.image;
    var url = opts.url;

    require.async("dpapp-share", function(share){
      share.pop({
        title: title,
        desc: desc,
        content: content,
        pic: pic,
        url: url
      });
      success && success();
    });
  },
  sendSMS: notImplemented,
  login: function(opts){
    require.async("easy-login", function(EasyLogin){

      var elem = document.createElement('div');
      var loginButton = document.createElement('input');
      loginButton.value = "login";
      loginButton.type = "button";

      elem.appendChild(loginButton);

      document.body.appendChild(elem);

      var myLogin = EasyLogin(elem, {
        platform: "mobile",  //平台， mobile or pc
        channel: "1"     //找账户中心申请的渠道ID
      });

      //处理Info信息
      myLogin.on("info",function(msg){
        console.log(msg);
      });

      //处理错误信息
      myLogin.on("error",function(msg){
        opts.fail && opts.fail();
      });

      //处理登录成功事件
      myLogin.on("login",function(){
        opts.success && opts.success();
        //do something here
      });

      loginButton.onclick = function(){
        myLogin.login(); //触发登录
      }

    });
  }
});

/**
 * UI
 */
Efte.extend({
  setTitle: function(opts) {
    var title = opts.title;
    if(title){
      document.title = title;
    }
  },
  setRLButton: notImplemented,
  setRRButton: notImplemented
});


/**
 * Broadcast
 */
var _events = {};
Efte.extend({
  subscribe: function(opts) {
    if(!opts.action){return;}
    var name = opts.action;
    var success = opts.success;
    var handle = opts.handle;
    if(!handle){return;}
    if(_events[name]){
      _events[name].push(handle);
    }else{
      _events[name] = [handle];
    }
    success && success();
  },
  unsubscribe: function(opts){
    if(!opts.action){return;}
    var name = opts.action;
    var success = opts.success;
    var handle = opts.handle;
    var events = _events;
    var funcs = events[name];
    if(!funcs){return}
    if(handle){
      var index = funcs.indexOf(handle);
      events[name] = funcs.splice(index,1);
    }else{
      delete events[name];
    }
    success && success();
  },
  publish: function(opts){
    if(!opts.action){return;}
    var name = opts.action;
    var data = opts.data;
    var funcs = _events[name];
    funcs && funcs.forEach(function(func){
      func(data);
    });
    success && success();
  }
});

module.exports = Efte;
}, {
    map:mix({"./core":_5},globalMap)
});

define(_5, [], function(require, exports, module, __filename, __dirname) {
function mixin(to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}
var Efte = module.exports = {
  _cfg: {
    debug: false
  },
  config: function(config) {
    this._cfg = config;
  },
  Semver: {
    eq: function(a, b) {
      return a === b;
    },
    gt: function(a, b) {
      var splitedA = a.split(".");
      var splitedB = b.split(".");
      if (+splitedA[0] > +splitedB[0]) {
        return true;
      } else {
        if (+splitedA[1] > splitedB[1]) {
          return true;
        } else {
          return splitedA[2] > splitedB[2];
        }
      }
    },
    lt: function(a, b) {
      return !this.gte(a, b);
    },
    gte: function(a, b) {
      return this.eq(a, b) || this.gt(a, b);
    },
    lte: function(a, b) {
      return this.eq(a, b) || this.lt(a, b);
    }
  },
  Share: {
    WECHAT_FRIENDS: 0,
    WECHAT_TIMELINE: 1,
    QQ: 2,
    SMS: 3,
    WEIBO: 4,
    QZONE: 5,
    EMAIL: 6,
    COPY: 7
  },
  _osUA: (function() {
    var ua = navigator.userAgent;
    var osName, osVersion;
    if (ua.match(/iPhone/)) {
      osName = "iphone";
      osVersion = ua.match(/iPhone\sOS\s([\d_]+)/i)[1].replace(/_/g, ".");
    } else if (ua.match(/Android/)) {
      osName = "android";
      osVersion = ua.match(/Android\s([\w\.]+)/)[1]
    } else {
      osName = null;
      osVersion = null;
    }
    return {
      name: osName,
      version: osVersion
    }
  })(),
  _uaVersion: (function(){
    // ua格式的版本
    var userAgent = navigator.userAgent;

    if(/dp\/com\.dianping/.test(userAgent)){
      return "7.1.x";
    }else if(/MApi/.test(userAgent)){
      return "7.0.x";
    }else{
      return "6.9.x";
    }
  })(),
  log: function() {

    var message = [];
    for(var i=0; i < arguments.length; i++){
      if(typeof arguments[i] == "string"){
        message.push(arguments[i]);
      }else if(arguments[i] != undefined){
        message.push(JSON.stringify(arguments[i]));
      }
    }

    message = message.join(" ");
    if (this._cfg && this._cfg.debug) {
      alert(message);
    }else{
      console.log(message);
    }
  },
  _mixin: mixin,
  extend: function(args) {
    return this._mixin(this, args);
  },
  _notImplemented: function notImplemented(opt) {
    opt && opt.fail && opt.fail({
      errMsg:"ERR_NOT_IMPLEMENTED"
    });
  },
  isSupport: function(funcName) {
    var api = Efte[funcName];
    return api && typeof api == "function" && api != Efte._notImplemented
  }
};

if(window.DPApp){
  Efte = mixin(window.DPApp, Efte);
}
}, {
    map:globalMap
});

define(_6, [], function(require, exports, module, __filename, __dirname) {
var queue = module.exports = function(worker){
	var currentData = null;
	var currentCallback = null;
	var q = {
		timeout: null,
		running : false,
		tasks: [],
		push: function(data, cb){
			var callback = cb || function(data){}
			q.tasks.push({
				data: data,
				callback: callback
			});
			setTimeout(function(){
				q.process();
			}, 0);
		},
		dequeue: function(){
			currentCallback && currentCallback();
		},
		process: function(){
			if(q.tasks.length && !q.running){
				var task = q.tasks.shift();
				q.running = true;
				currentCallback = function(){
					q.running = false;
					task.callback(task.data);
					q.process();
				};
				currentData = task.data;
				worker(task.data, currentCallback);
			}
		}
	}
	return q;
};
}, {
    map:globalMap
});
})();_use("dpapp@1.0.1",function(){});