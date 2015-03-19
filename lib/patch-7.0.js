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

  efte.uploadImage = function(opts){
    var success = opts.success;
    var fail = opts.fail;
    var handle = opts.handle;
    efte._sendMessage("uploadImage", opts, function(result){
      var status = result.status;
      if(status == "fail"){
        fail && fail(result);
        return;
      }else if(status == "success"){
        success && success(result);
        return;
      }else if(status == "action"){
        handle && handle(result);
      }
    });
  };
  efte.closeWindow = function(){
    this._sendMessage('close_web');
  };
};