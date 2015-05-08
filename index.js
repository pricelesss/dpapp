(function (Host) {
  var _DPApp;
  var version;
  var userAgent = Host.navigator.userAgent;
  var apis = require('./lib/apilist');
  var DPAppNativeCore = require('./lib/native-core');
  var decorate = function(){
    require('./lib/decorator')(_DPApp);
  };
  require('./lib/errortrace');
  // Require different platform js base on userAgent.
  // Native part will inject the userAgent with string `DPApp`.

  function getQuery(){
    var query = location.search.slice(1);
    var ret = {};
    query.split("&").forEach(function(pair){
      var splited = pair.split("=");
      ret[splited[0]] = splited[1];
    });
    return ret;
  }

  if (DPAppNativeCore._uaVersion == "7.1.x") {
    _DPApp = DPAppNativeCore.extend(require('./lib/patch-7.1'));
    decorate();
  } else if(DPAppNativeCore._uaVersion == "7.0.x"){
    // 目前有修改UA，而api尚未对齐的仅7.0版本
    _DPApp = DPAppNativeCore.extend(require('./lib/patch-7.0'));
    decorate();
  } else{
    var patch6 = require('./lib/patch-6.x');
    var web = require('./lib/web');
    var query = getQuery();

    // 默认认为6.x，当接口调用失败，认为是web
    _DPApp = DPAppNativeCore.extend(patch6);
    _DPApp._patch6Ready = _DPApp.ready;
    _DPApp.ready = function(callback){
      var _callback = function(){
        _DPApp._trace('ready');
        callback();
      }
      if(DPApp._isReady){
        return _callback();
      }

      if(query.cityid=="!"){
        patchWeb();
        return;
      }

      function patchWeb(){
        _DPApp._bindDOMReady(function(){
          // remove 6.x apis and append web apis
          apis.forEach(function(api){
            if(_DPApp[api]){
              delete _DPApp[api];
            }
            _DPApp[api] = web[api];
          });
          decorate();
          _callback();
        });
      }
      var timeout = setTimeout(patchWeb, 50);
      _DPApp._patch6Ready(function(){
        clearTimeout(timeout);
        decorate();
        _callback();
      });
    } 
  }

  _DPApp.getQuery = getQuery;
  // Export DPApp object, if support AMD, CMD, CommonJS.
  if (typeof module !== 'undefined') {
    module.exports = _DPApp;
  }

  // Export DPApp object to Host
  if (typeof Host !== 'undefined') {
    if(Host.DPApp){
      _DPApp._mixin(Host.DPApp, _DPApp);
    }else{
      Host.DPApp = _DPApp;
    }
  }

}(this));