(function (Host) {
  var Efte;
  var patch;
  var patchVersion;
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
    Efte = require('./lib/native');
  } else if(/MApi/.test(userAgent)){
    Efte = require('./lib/native');
    patchVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/);
    // 目前有修改UA，而api尚未对齐的仅7.0版本
    patchVersion = patchVersion[1];
    if(patchVersion.indexOf("7.0") == 0){
      patch = require('./lib/patch-7.0');
      patch(Efte);
    }
  } else{
    // 认为是在web中
    if(getQuery().product == "dpapp"){
      Efte = require('./lib/native');
      patch = require('./lib/patch-6.x');
      patch(Efte);
    }else{
      // 7.0之前的古早版本，是否需要支持？
      Efte = require('./lib/web');
    }
  }

  // Export Efte object, if support AMD, CMD, CommonJS.
  if (typeof module !== 'undefined') {
    module.exports = Efte;
  }

  // Export Efte object to Host
  if (typeof Host !== 'undefined') {
    Host.Efte = Host.DPApp = Efte;
  }
}(this));



// 7.0 之前没有