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