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
      target._trace(api + "_call");
      var _success = _args.success;
      var _fail = _args.fail;
      var _wrapped_fail = function(result){
        if(!_fail){
          if(target.onerror){
            target.onerror(result);
          }else{
            var err = new Error(result);
            err.name = "DPAppError";
            throw new Error(err);
          }
        }else{
          _fail(result);
        }
      }
      var zero = +new Date;
      _args.success = function(result){
        target._trace(api + "_success", {
          time: +new Date - zero,
        });
        _success && _success(result);
      };
      _args.fail = function(result){
        var note = {};
        note.args = args;
        note.result = result;
        target._trace(api + "_fail", {
          time: +new Date - zero,
          note: JSON.stringify(note)
        });
        _wrapped_fail(result);
      }

      if(!this._isReady){
        console.error("`DPApp." + api + "` should be called after DPApp.ready");
        _wrapped_fail("use `DPApp.ready(fn)` to wrap api calls");
        return;
      }
      _origin.call(target, _args);
    }
    target[api]._decorated = true;
    if(_origin == target._notImplemented){
      target[api]._notReady = true;
    }
  });

  window.DPApp = target;
}