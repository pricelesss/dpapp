function mixin(to, from) {
  for (var key in from) {
    to[key] = from[key];
  }
  return to;
}
var core = module.exports = {
  _cfg: {
    debug: false
  },
  _isProduct: !!location.href.match(".dianping.com"),
  _isReady: false,
  config: function(config) {
    for(var key in config){
      this._cfg[key] = config[key];
    }
  },
  _bindDOMReady: function(fn){
    var self = this;
    var readyRE = /complete|loaded|interactive/;
    if (readyRE.test(document.readyState) && document.body){
      self._isReady = true;
      fn();
    }else{
      document.addEventListener('DOMContentLoaded', function(){
      self._isReady = true;
      fn()
    }, false);
    }
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
  _trace: function(name, params){
    var logFact = (this._cfg && this._cfg.logFact) || 0.01;
    params = params || {};
    params = this._mixin(params, {
      version: this.getUA().appVersion,
      module: "dpapp_" + name
    });
    if(Math.random() < logFact){
      console.log("_trace", name)
      window._hip && _hip.push(['mv', params]);
    }
  },
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
    var api = this[funcName];
    return !!(api
      && typeof api == "function"
      && api != core._notImplemented
      && api._notReady != true)
  }
};

if(window.DPApp){
  core = mixin(window.DPApp, core);
}