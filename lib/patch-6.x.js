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
    this._sendMessage("getEnv", null, callback);
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
    efte._sendMessage('cx', {
      business: business
    }, success);
  },

  closeWindow : function() {
    efte._sendMessage("close_web");
  },
  setTitle : function(opt) {
    document.title = opt.title;
    var success = opt.success;
    var title = opt.title;
    efte._sendMessage("setTitle", {
      title: title
    }, function() {});
  },
  openScheme : function(opt){
    efte._sendMessage('actionScheme', {url: opt.url});
  },
  ajax : function(opts) {
    opts = efte._sanitizeAjaxOpts(opts);
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
    efte._sendMessage("ajax", opts, function(data) {
      if (data.code == 0) {
        var result = efte._mixin(
          parseJSON(data.responseText),
          efte._transModel(opts.keys, parseJSON(data.hashJson))
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
    this._getEnv(function(){

    });

    document.addEventListener("DOMContentLoaded", function(event) {
      callback();
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