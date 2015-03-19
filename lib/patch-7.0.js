module.exports = function(efte){

	efte.getUA = function(opt){
		var result = {};
  	var success = opt && opt.success;
  	var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
  	var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: Efte._osUA.name,
      osVersion: Efte._osUA.version
    };
  	success && success(ua);
    return ua;
	}

  var apis = [
  /**
   * Infos
   */
    "getUserInfo", "getCityId", "getLocation", "getContactList", "getCX",
  /**
   * Common
   */
    "getRequestId", "uploadImage", "downloadImage", "closeWindow", /* getNetworkType, share */
  /**
   * Funcs
   */
    "sendSMS", "openScheme", /* ajax */
  /**
   * Broadcast
   */
    "login",
  /**
   * UI
   */
    "setTitle"
  ];

  efte.getUA = function(opt){
    var result = {};
    var success = opt && opt.success;
    var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: Efte._osUA.name,
      osVersion: Efte._osUA.version
    };
    success && success(ua);
    return ua;
  };

  efte.closeWindow = function(){
    this._sendMessage('close_web');
  };
  efte.isSupport = function(opts){
    var api = opts.api;
    var success = opts.success;
    var apiList = apis.concat([
      "getUA",
      "getNetworkType",
      "share",
      "ajax",
      "pay"
    ]);

    success && success({
      support: apiList.indexOf(api) != -1
    });
  };
};