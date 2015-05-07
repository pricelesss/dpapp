var core = module.exports = require('./core');
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
  core._doSendMessage(data.method, data.args, data.callback);
});

core.extend({
  _callbacks: core._callbacks || {},
	_dequeueTimeout: null,
  dequeue: function(){
    clearTimeout(this._dequeueTimeout);
    this._dequeueTimeout = null;
    q.dequeue();
  },
  _sendMessage: function(method, args, callback){
    var self = this;
    q.push({
      method: method,
      args: args,
      callback: callback
    });
    this._dequeueTimeout = setTimeout(function(){
      self.dequeue();
    },1000);

  },
  /**
   * send message to native
   * @param  {String}   method
   * @param  {Object}   args
   * @param  {Function} callback
   */
  _doSendMessage: function (method, args, callback, options) {
      var hasCallback = callback && typeof callback == 'function';
      options = options || {};
      var type = options.type;
      this.log('调用方法', method, args);

      /**
       * pass 0 as callbackId
       * thus _callbacks[callbackId] is undefined
       * nothing will happen
       * @type {Number}
       */
      var callbackId = hasCallback ? callbacksCount++ : 0;
      if (hasCallback){
        this._callbacks[callbackId] = callback;
      }

      /**
       * check type for args
       */
      if(!args || typeof args !== 'object'){
        args = {};
      }

      // 某些版本app很任性的把callbackId参数放到args里了
      args.callbackId = callbackId;
      args = JSON.stringify(args);

      var bridgeUrl = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId;

      if(type == "script"){
        this._createScript(bridgeUrl);
      }else{
        this._createIframe(bridgeUrl);
      }
  },
  _createNode: function(src, type){
    /**
     * create node
     * and native will intercept and handle the process
     */
    var node = document.createElement(type);
    node.style.display = 'none';
    document.body.appendChild(node);

    function removeNode(){
      node.onload = node.onerror = null;
      node.parentNode && node.parentNode.removeChild(node);
    }
    /**
     * remove node after loaded
     */
    node.onload = node.onerror = removeNode;
    setTimeout(removeNode, 5000);
    node.src = src;
  },
  _createScript: function(src){
    this._createNode(src, "script");
  },
  _createIframe: function(src){
    this._createNode(src, "iframe");
  },
  _send: function(method, args){
    args = args || {};
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
  _convertUrlParams: function(params){
    var result = [];
    for(var i in params){
      result.push(i + "=" + encodeURIComponent(params[i]));
    }
    return result.join("&");
  },
  _sanitizeAjaxOpts: function(args){
    args.method = args.method || "get";
    args.data = args.data || "";
    var url = args.url;
    var data = args.data;

    if (args.method == "get") {
      var params = [];
      for (var p in data) {
        if (data.hasOwnProperty(p) && (data[p] || data[p] === 0)) {  // allow `something=0' param
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
  _parseFeed: function(f){
    var feed;
    if (!f) {
      return 0xff;
    } else if (f.constructor.toString().indexOf("Array") >= 0) {
      feed = [0, 0, 0, 0, 0, 0, 0, 0];
      f.forEach(function(pos) {
        feed[7 - pos] = 1;
      });
      return parseInt(feed.join(""), 2);
    }
  },
  _transModel: function(keys, obj){
    if(!keys){return obj;}
    var keymap = {};

    function getHash(str) {
      var hashCode = function(str) {
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
        keymap[getHash(key)] = key;
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
    callback && callback.call(this,retValue);
    if(retValue.result == "complete" || retValue.result == "error"){
      this._callbacks[callbackId] = null;
      delete this._callbacks[callbackId];
    }
  }
});