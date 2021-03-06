var apis = require('./apilist');
var core = require('./core');
var allowBeforReady = ['getRequestId'];

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
            target.onerror({
              api: api,
              err: result
            });
          }else{
            var errorMessage = result.errMsg ? result.errMsg : JSON.stringify(result);
            var err = new Error(errorMessage);
            err.name = "DPAppError";
            console.error("`DPApp." + api + "` call faild");
            target._trace('throw');
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

      if(!this._isReady
        && allowBeforReady.indexOf(api) === -1
        && !target._isProduct // 非正式环境
        && target._uaVersion == "6.9.x" // 且非新版本，为了判断环境，必须wrap在DPApp.ready中
      ){
        _wrapped_fail("use `DPApp.ready(fn)` to wrap api calls");
        return;
      }
      return _origin.call(target, _args);
    }
    target[api]._decorated = true;
    target[api]._notReady = _origin == target._notImplemented;

  });
}