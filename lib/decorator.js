var apis = require('./apilist');
var core = require('./core');

module.exports = function decorateForTrace(target){

  apis.forEach(function(name){
    if(!target[name]){
      target[name] = core._notImplemented;
    }
  });


  apis.forEach(function(api){
    var _origin = target[api];
    if(target[api] && target[api]._decorated){
      return;
    }
    target[api] = function(args){
      var _args = core._mixin({}, args);
      DPApp._trace(api + "_call");
      var _success = _args.success;
      var _fail = _args.fail;
      _args.success = function(result){
        target._trace(api + "_success");
        _success(result);
      };
      _args.fail = function(result){
        target._trace(api + "_fail");
        _fail(result);
      }
      _origin.call(target, _args);
    }
    target[api]._decorated = true;
    if(_origin == target._notImplemented){
      target[api]._notReady = true;
    }
  });

  return target;
}