var Efte = module.exports = require('./core');
/**
 * count from 1
 * @type {Number}
 */
var callbacksCount = 1;
/**
 * mapping for all callbacks
 * @type {Object}
 */

var queue = require('./queue');
var q = queue(function(data){
  Efte._doSendMessage(data.method, data.args, data.callback);
});

Efte.extend({
  _callbacks: [],
	_dequeueTimeout: null,
  dequeue: function(){
    clearTimeout(this._dequeueTimeout);
    this._dequeueTimeout = null;
    q.dequeue();
  },
  _sendMessage: function(method, args, callback){
    q.push({
      method: method,
      args: args,
      callback: callback
    });
    this._dequeueTimeout = setTimeout(this.dequeue.bind(this),1000);
  },
  /**
   * send message to native
   * @param  {String}   method
   * @param  {Object}   args
   * @param  {Function} callback
   */
  _doSendMessage: function (method, args, callback) {
      var hasCallback = callback && typeof callback == 'function';

      this.log('调用方法', method, args);

      /**
       * pass 0 as callbackId
       * thus _callbacks[callbackId] is undefined
       * nothing will happend
       * @type {Number}
       */
      var callbackId = hasCallback ? callbacksCount++ : 0;
      if (hasCallback){
        this._callbacks[callbackId] = callback;
      }

      /**
       * create iframe，
       * and native will intercept and handle the process
       */
      var ifr = document.createElement('iframe');
      ifr.style.display = 'none';
      document.body.appendChild(ifr);

      function removeIframe(){
        ifr.onload = ifr.onerror = null;
        ifr.parentNode && ifr.parentNode.removeChild(ifr);
      }
      /**
       * remove iframe after loaded
       */
      ifr.onload = ifr.onerror = removeIframe;
      setTimeout(removeIframe,5000);


      /**
       * check type for args
       */
      if(typeof args !== 'object'){
        args = {};
      }

      var oldProto = (this._uaVersion !== "7.1.x");
      if(oldProto){
        args.callbackId = callbackId;
      }

      args = JSON.stringify(args);

      ifr.src =  'js://_?method=' + method + '&args=' + encodeURIComponent(args) + (oldProto ? '' : ('&callbackId=' + callbackId));
  },
  _send: function(method, args){
    var self = this;
    var _success = args.success;
    var _fail = args.fail;
    var _handle = args.handle;

    var fail = function(result){
      self.log('调用失败', result);
      _fail && _fail.call(self, result);
    }

    var success = function(result){
      self.log('调用成功', result);
      _success && _success.call(self, result);
    }

    var handle = function(result){
      self.log('回调', result);
      _handle && _handle.call(self, result);
    }

    var callback = (_success || _fail || _handle) ? function(result){
      var status = result.status;
      if(result.result != "next"){
        delete result.result;
      }
      if(status == "success"){
        success && success(result);
      }else if(status == "action"){
        handle && handle(result);
      }else{
        fail && fail(result);
      }
    } : null;
    this._sendMessage(method, args, callback);
  },
  _sanitizeAjaxOpts: function(args){
    args.method = args.method || "get";
    args.data = args.data || "";
    var url = args.url;
    var data = args.data;

    if (args.method == "get") {
      var params = [];
      for (var p in data) {
        if (data[p]) {
          params.push(p + '=' + encodeURIComponent(data[p]));
        }
      }

      if (params.length) {
        url += url.indexOf('?') == -1 ? "?" : "&";
        url += params.join('&');
      }
      args.url = url;
      delete args.data;
    }
    return args;
  },
  _transModel: function(keys, obj){
    if(!keys){return obj;}
    var keymap = {};

    function getHash(str) {
      hashCode = function(str) {
        var hash = 0,
          i, chr, len;
        if (str.length == 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
          chr = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };

      var i = hashCode(str);
      return "0x" + ((0xFFFF & i) ^ (i >>> 16)).toString(16);
    }

    function generateKeys(keys) {
      keys.forEach(function(key) {
        keyMap[getHash(key)] = key;
      });
    }

    function isArray(val) {
      return Object.prototype.toString.call(val) == "[object Array]";
    }

    function isObject(val) {
      return Object.prototype.toString.call(val) == "[object Object]";
    }

    function translate(obj){
      if (isObject(obj)) {
        delete obj.__name;
        for (var key in obj) {
          var val;
          if (keymap[key]) {
            val = obj[keymap[key]] = obj[key];
            translate(val);
            delete obj[key];
          }
        }
      } else if (isArray(obj)) {
        obj.forEach(function(item) {
          translate(item);
        });
      }
      return obj;
    }

    keys.forEach(function(key) {
      keymap[getHash(key)] = key;
    });

    return translate(obj);
  },
  /**
   * callback function to be invoked from native
   * @param  {Number} callbackId
   * @param  {Object} retValue
   */
  callback: function(callbackId, retValue) {
    var callback = this._callbacks[callbackId];
    callback && callback(retValue);
    if(retValue.result == "complete" || retValue.result == "error"){
      this._callbacks[callbackId] = null;
      delete this._callbacks[callbackId];
    }
  },
});