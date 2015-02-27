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
"ajax", "ga", "uploadImage", "downloadImage", "closeWindow",
/**
 * Funcs
 */
"pay", "share", "sendSMS",
/**
 * Broadcast
 */
"subscribe", "unsubscribe"
].forEach(function(name){
	Efte.register(name);
});

/**
 * Efte has to be exposed to window
 * so that Efte.callback could be called with jsbridge
 */
module.exports = Efte;