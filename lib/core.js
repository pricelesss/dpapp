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

  log: function(tag, message) {
    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }
    console.log(tag + ":" + message);
    if (this._cfg && this._cfg.debug) {
      alert(tag + ":" + message);
    }
  },
  _mixin: function(to, from) {
    for (var key in from) {
      to[key] = from[key];
    }
    return to;
  },
  extend: function(args) {
    this._mixin(Efte, args);
  },
  notImplemented: function notImplemented(opt) {
    opt && opt.fail && opt.fail("ERR_NOT_IMPLEMENTED");
  }
};