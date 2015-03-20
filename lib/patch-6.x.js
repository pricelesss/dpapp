module.exports = function(efte) {
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

  efte._sendMessage = function(key, args, callback) {
    var callbacks = callbackLists[key];
    var noCallback = ["share","actionScheme"];
    if(noCallback.indexOf(key) != -1){
      this._doSendMessage(key, args, callback);
    } else if(!callbacks){
      callbacks = callbackLists[key] = [callback];
      this._doSendMessage(key, args, callback);
    } else {
      callbacks.push(callback);
    }
  };

  efte.callback = function(callbackId, retValue) {
    if (retValue.dpid && retValue.cityid && retValue.network) {
      cachedEnv = retValue;
      dealCallback("getEnv", retValue);
    } else if (retValue.cx) {
      dealCallback("cx", retValue);
    } else if (retValue.hashJson || (retValue.code && retValue.message)) {
      dealCallback("ajax", retValue);
    } else{
      alert("callbackId:" + callbackId);
      alert("retValue:" + JSON.stringify(retValue));
      var callback = this._callbacks[callbackId];
      callback && callback(retValue);
    }
  };

  efte._getEnv = function(callback) {
    this._sendMessage("getEnv", null, callback);
  }

  efte.getUA = function(opt) {
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
  };

  efte.getCityId = function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        cityId: result.cityid
      });
    });
  }

  efte.getNetworkType = function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        networkType: result.network
      });
    });
  }

  efte.getUserInfo = function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        token: result.token,
        dpid: result.dpid,
        userId: result.userId
      });
    });
  }

  efte.getLocation = function(opt) {
    var success = opt.success;
    this._getEnv(function(result) {
      success && success({
        lat: result.latitude,
        lng: result.longitude
      });
    });
  }

  efte.getCX = function(opt) {
    var business = opt.business;
    var success = opt.success;
    efte._sendMessage('cx', {
      business: business
    }, success);
  };

  efte.closeWindow = function() {
    efte._sendMessage("close_web");
  };

  efte.setTitle = function(opt) {
    document.title = opt.title;
    var success = opt.success;
    var title = opt.title;
    efte._sendMessage("setTitle", {
      title: title
    }, function() {});
  };

  efte.openScheme = function(opt){
    efte._sendMessage('actionScheme', {url: opt.url});
  };

  efte.login = function(){
    efte.openScheme({
      url: "dianping://login"
    });
  }

  efte.ajax = function(opts) {
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
  };

  efte.ready = function(callback){
    this._getEnv(function(){

    });

    document.addEventListener("DOMContentLoaded", function(event) {
      callback();
    });
  }

  efte.share = function(opts){
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
  }

  efte.subscribe = efte.getRequestId = efte.uploadImage  = efte.getContactList = efte.unsubscribe = efte.publish = efte.setLLButton = efte.setLRButton = efte.setRLButton = efte.setRRButton = efte._notImplemented;

  efte.isStatusOK = function() {};
  efte.did_handle_callback = function() {};
};