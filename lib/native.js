var Efte = require('./core');

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
"pay", "sendSMS",
/**
 * Broadcast
 */
"subscribe", "unsubscribe", "publish",
/**
 * UI
 */
"setTitle", "setLLButton", "setLRButton", "setRLButton", "setRRButton"
].forEach(function(name){
	Efte[name] = function(options){
    this._send(name, options);
  }
});

Efte.config = function(config){
	this._cfg = config;
}

Efte.Share = {
	WECHAT_FRIENDS: 0,
	WECHAT_TIMELINE: 1,
	QQ: 2,
	SMS: 3,
	WEIBO: 4,
	QZONE: 5,
	EMAIL: 6,
	COPY: 7
};

Efte.share = function(opts){
	alert(Efte.share);
	if(!opts.feed){
		opts.feed = 0xff;
	}else if(opts.feed.constructor.toString().indexOf("Array") >= 0){
		var feed = [0,0,0,0,0,0,0,0];
		opts.feed.forEach(function(pos){
			feed[ 7 - pos] = 1;
		});
		opts.feed = parseInt(feed.join(""),2);
	}

	this._send("share", opts);
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

Efte.pay = function(args){
	var _success = args.success;
	var _fail = arg._fail;

}

/**
 * Efte has to be exposed to window
 * so that Efte.callback could be called with jsbridge
 */
module.exports = Efte;