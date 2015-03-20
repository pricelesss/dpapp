var core = require('./core');
var patch6 = require('./patch-6.x');
var Patch = module.exports = core._mixin(patch6, {
	getUA : function(opt){
		var result = {};
  	var success = opt && opt.success;
  	var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
  	var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: this._osUA.name,
      osVersion: this._osUA.version
    };
  	success && success(ua);
    return ua;
	},

  getUA : function(opt){
    var result = {};
    var success = opt && opt.success;
    var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: this._osUA.name,
      osVersion: this._osUA.version
    };
    success && success(ua);
    return ua;
  },

  uploadImage : function(opts){
    var success = opts.success;
    var fail = opts.fail;
    var handle = opts.handle;

    this._sendMessage("uploadImage", opts, function(result){
      var status = result.status;
      if(status == "fail"){
        fail && fail(result);
        return;
      }else{
        handle && handle(result);
      }
    });
  },

  closeWindow : function(){
    this._sendMessage('close_web');
  }
});