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

  if (/dp\/com\.dianping/.test(userAgent)) {
    Efte = require('./lib/native-core');
    require('./lib/patch-7.1')(Efte);
  } else if(/MApi/.test(userAgent)){
    Efte = require('./lib/native-core');
    version = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/);
    // 目前有修改UA，而api尚未对齐的仅7.0版本
    version = version[1];
    if(version.indexOf("7.0") == 0){
      require('./lib/patch-6.x')(Efte);
      require('./lib/patch-7.0')(Efte);
    }
  } else{
    // 更早的7.0之前的古早版本
    if(getQuery().product == "dpapp"){
      Efte = require('./lib/native-core');
      require('./lib/patch-6.x')(Efte);
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