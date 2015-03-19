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
var callbacks = {};
var queue = require('./queue');
var q = queue(function(data){
  Efte._doSendMessage(data.method, data.args, data.callback);
});

Efte.extend({
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

      /**
       * check type for args
       */
      if(typeof args !== 'object'){
        args = {};
      }

      args = JSON.stringify(args);

      this.log('调用方法', method + ":" + args);

      /**
       * pass 0 as callbackId
       * thus callbacks[callbackId] is undefined
       * nothing will happend
       * @type {Number}
       */
      var callbackId = hasCallback ? callbacksCount++ : 0;
      if (hasCallback){
        callbacks[callbackId] = callback;
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
      ifr.src = 'js://_?method=' + method + '&args=' + encodeURIComponent(args) + '&callbackId=' + callbackId;
  },
  _send: function(method, args){
    var self = this;
    var _success = args.success;
    var _fail = args.fail;
    var _handle = args.handle;

    var fail = function(result){
      self.log('调用失败', result);
      _fail && _fail.call(null, result);
    }

    var success = function(result){
      self.log('调用成功', result);
      _success && _success.call(null, result);
    }

    var handle = function(result){
      self.log('回调', result);
      _handle && _handle.call(null, result);
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
  /**
   * callback function to be invoked from native
   * @param  {Number} callbackId
   * @param  {Object} retValue
   */
  callback:function(callbackId, retValue) {
    var callback = callbacks[callbackId];
    callback && callback(retValue);
    if(retValue.result == "complete" || retValue.result == "error"){
      callbacks[callbackId] = null;
      delete callbacks[callbackId];
    }
  },
});