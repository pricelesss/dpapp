var Efte = require('./core');

Efte.register = function(name){
  this[name] = function(options){
    this._send(name, options);
  }
};

[
/**
 * Infos
 */
"getUserInfo", "getLocation", "getNetworkType", "getContactList", "getCX",
/**
 * Common
 */
"mapi", "ga", "uploadImage", "downloadImage", "closeWindow",
/**
 * Funcs
 */
"pay", "share", "sendSMS",
/**
 * Broadcast
 */
"subscribe", "unsubscribe",
/**
 * UI]
 */
"setTitle", "setLLButton", "setLRButton", "setRLButton", "setRRButton"
].forEach(function(name){
	Efte.register(name);
});

Efte.config = function(config){
	this._cfg = config;
}

Efte.ready = function(callback){
	this._send("ready", {
		success: function(){
			callback();
		}
	});
};

Efte.ajax = function(args){
	var _success = args.success;
	args.success = function(e){
		_success(e.mapiResult);
	};
	Efte.mapi(args);
};


/**
 * Efte has to be exposed to window
 * so that Efte.callback could be called with jsbridge
 */
module.exports = Efte;