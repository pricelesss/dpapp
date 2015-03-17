module.exports = function(efte){

	efte.getUA = function(opt){
		var result = {};
  	var success = opt && opt.success;
  	var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
  	var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      deviceName: Efte._deviceUA.name,
      deviceVersion: Efte._deviceUA.version
    };
  	success && success(ua);
    return ua;
	}

};