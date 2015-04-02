var core = require('./core');
var NOOP = function() {};
var cachedEnv = {};
var callbackLists = {};

function dealCallback(key, value) {
  var list = callbackLists[key];
  if (list) {
    list.forEach(function(callback) {
      callback(value);
    });
    delete callbackLists[key];
  }
}

var Patch = module.exports = {

  _sendMessage : function(key, args, callback) {

    this._doSendMessage(key, args, callback);
  },

  _getEnv : function(callback) {
    this._sendMessage("getEnv", null, function(env){
      cachedEnv = env;
      callback.call(this, env);
    });
  },

  Share: {
    WECHAT_FRIENDS: 7,
    WECHAT_TIMELINE: 6,
    QQ: 5,
    SMS: 4,
    WEIBO: 3,
    QZONE: 2,
    EMAIL: 1,
    COPY: 0
  },

  getUA : function(opt) {
    var success = opt && opt.success;
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: cachedEnv && cachedEnv.version,
      osName: Efte._osUA.name,
      osVersion: Efte._osUA.version
    };
    success && success(ua);
    return ua;
  },

  initShare: function(opt){
    var success = opt.success;
    var fail = opt.fail;
    var src = "dpshare://_?content=";
    src += encodeURIComponent(JSON.stringify({
      title: opt.title,
      desc: opt.desc,
      image: opt.image,
      feed: this._parseFeed(opt.feed),
      url: opt.url
    }));
    this.shareCallback = function(result){
      if(result.status == "success"){
        success && success(result);
      }else{
        fail && fail(result);
      }
    };
    this._createIframe(src);
  },
  shareCallback: function(){
  },
  getCityId : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        cityId: result.cityid
      });
    });
  },

  getNetworkType : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        networkType: result.network
      });
    });
  },

  getUserInfo : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        token: result.token,
        dpid: result.dpid,
        userId: result.userId
      });
    });
  },

  getLocation : function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        lat: result.latitude,
        lng: result.longitude
      });
    });
  },

  getCX : function(opt) {
    var business = opt.business;
    var success = opt.success;
    this._sendMessage('cx', {
      business: business
    }, success);
  },

  closeWindow : function() {
    this._sendMessage("close_web");
  },
  setTitle : function(opt) {
    document.title = opt.title;
    var success = opt.success;
    var title = opt.title;
    this._sendMessage("setTitle", {
      title: title
    }, function() {});
  },
  openScheme : function(opt){
    this._sendMessage('actionScheme', {url: opt.url});
  },
  ajax : function(opts) {
    opts = this._sanitizeAjaxOpts(opts);
    var self = this;
    var success = opts.success;
    var fail = opts.fail;
    function parseJSON(data){
      var ret = {};
      if (data && data.length > 0) {
        try {
          ret = JSON.parse(data);
        } catch (ignore) {}
      }
      return ret;
    }
    this._sendMessage("ajax", opts, function(data) {
      if (data.code == 0) {
        var result = this._mixin(
          parseJSON(data.responseText),
          this._transModel(opts.keys, parseJSON(data.hashJson))
        );
        success && success(result);
      } else {
        fail && fail({
          code: data.code,
          errMsg: data.message
        });
      }
    });
  },

  ready : function(callback){
    var self = this;
    this._getEnv(function(){
      callback.call(self);
    });
  },

  share : function(opts){
    if (!opts.feed) {
      opts.feed = 0xff;
    } else if (opts.feed.constructor.toString().indexOf("Array") >= 0) {
      var feed = [0, 0, 0, 0, 0, 0, 0, 0];
      opts.feed.forEach(function(pos) {
        feed[7 - pos] = 1;
      });
      opts.feed = parseInt(feed.join(""), 2);
    }

    this._sendMessage("share", opts);
  },

  isStatusOK : NOOP,
  did_handle_callback : NOOP
};

["subscribe","getRequestId","uploadImage","getContactList","unsubscribe","publish","setLLButton","setLRButton","setRLButton","setRRButton"].forEach(function(name){
  Patch[name] = core.notImplemented;
});