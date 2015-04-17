(function (Host) {
  var _DPApp;
  var version;
  var userAgent = Host.navigator.userAgent;
  var DPAppNativeCore = require('./lib/native-core');
  var decorator = require('./lib/decorator');
  var decorateForTrace = function(target){
    window.DPApp = decorator(target);
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
    DPApp = DPAppNativeCore.extend(require('./lib/patch-7.1'));
    decorateForTrace(DPApp);
  } else if(DPAppNativeCore._uaVersion == "7.0.x"){
    // 目前有修改UA，而api尚未对齐的仅7.0版本
    DPApp = DPAppNativeCore.extend(require('./lib/patch-7.0'));
    decorateForTrace(DPApp);
  } else{
    var patch6 = require('./lib/patch-6.x');
    var web = require('./lib/web');
    // 默认认为6.x，当接口调用失败，认为是web
    DPApp = DPAppNativeCore.extend(patch6);
    DPApp._patch6Ready = DPApp.ready;
    DPApp.ready = function(callback){
      var cfg = DPApp._cfg;
      var timeout = setTimeout(function(){
        DPApp._bindDOMReady(function(){
          web._cfg = cfg;
          web._isReady = DPApp._isReady;
          decorateForTrace(web);
          callback();
        });
      }, 50);
      DPApp._patch6Ready(function(){
        clearTimeout(timeout);
        callback();
      });
      decorateForTrace(DPApp);
    }
    decorateForTrace(DPApp);
  }

  DPApp.getQuery = getQuery;


  // Export DPApp object, if support AMD, CMD, CommonJS.
  if (typeof module !== 'undefined') {
    module.exports = _DPApp;
  }

  // Export DPApp object to Host
  if (typeof Host !== 'undefined') {
    if(Host.DPApp){
      DPApp._mixin(Host.DPApp, _DPApp);
    }else{
      Host.DPApp = _DPApp;
    }
  }

}(this));