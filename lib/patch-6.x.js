module.exports = function(efte){
  efte.getUA = function(opt){
    // var result = {};
    // var success = opt && opt.success;
    // var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
    // var ua = {
    //   platform: "dpapp",
    //   appName: "dianping",
    //   appVersion: appVersion,
    //   osName: Efte._osUA.name,
    //   osVersion: Efte._osUA.version
    // };
    // success && success(ua);
    // return ua;
  };

  var getEnvCallbacks;

  efte.callback = function(callbackId, retValue){
    if(retValue.dpid && retValue.cityid && retValue.network){
      // 因为没有callbackId判断部分特征，认为是getEnv的回调
      getEnvCallbacks.forEach(function(callback){
        callback(retValue);
      });
      getEnvCallbacks = null;
    }else{
      var callback = callbacks[callbackId];
      callback && callback(retValue);
    }
  };

  efte._getEnv = function(callback){
    if(!getEnvCallbacks){
      getEnvCallbacks = [callback];
      this._sendMessage("getEnv", null, callback);
    }else{
      getEnvCallbacks.push(callback);
    }
  }

  efte.getUA = function(opt){
    var success = opt && opt.success;

    this._getEnv(function(result){
      success && success({
        platform: "dpapp",
        appName: "dianping",
        appVersion: result.version,
        osName: Efte._osUA.name,
        osVersion: Efte._osUA.version
      });
    });
  };

  efte.getCityId = function(opt){
    var success = opt.success;
    this._getEnv(function(result){
      success && success({
        cityId: result.cityid
      });
    });
  }

  efte.getNetworkType = function(opt){
    var success = opt.success;
    this._getEnv(function(result){
      success && success({
        networkType: result.network
      });
    });
  }

  efte.getUserInfo = function(opt){
    var success = opt.success;
    this._getEnv(function(result){
      success && success({
        token: result.token,
        dpid: result.dpid,
        userId: result.userId
      });
    });
  }

  efte.getLocation = function(opt){
    var success = opt.success;
    this._getEnv(function(result){
      success && success({
        lat: result.latitude,
        lng: result.longitude
      });
    });
  }

  efte.setTitle = function(opt){
    document.title = opt.title;
    var success = opt.success;
    var title = opt.title;
    efte._sendMessage("setTitle",  {title: title}, function(){});
  }

  efte._sendMessage = efte._doSendMessage;

  efte.subscribe
  = efte.unsubscribe
  = efte.publish
  = efte.setLLButton
  = efte.setLRButton
  = efte.setRLButton
  = efte.setRRButton
  = efte.notImplemented;

  efte.isStatusOK = function(){};
  efte.did_handle_callback = function(){};
};