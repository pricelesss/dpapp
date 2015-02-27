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
var Efte = module.exports = {
  dequeue: function(){
    q.dequeue();
  },
  _log: function(tag, message){
    if(typeof message !== "string"){
      message = JSON.stringify(message);
    }
    console.log(tag + ":" + message);
    alert(tag + ":" + message);
  },
  _sendMessage: function(method, args, callback){
    q.push({
      method: method,
      args: args,
      callback: callback
    });
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
      if( typeof args !== 'object'){
        return console.warn(new Error('parameter `args` must be an object'));
      }else{
        args = JSON.stringify(args);
        this._log('调用方法', method);
        this._log('参数', args);
      }

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
    var fail = function(result){
      self._log('调用失败', result);
      _fail && _fail.call(null, result);
    }
    var success = function(result){
      delete result.result;
      self._log('调用成功', result);
      _fail && _fail.call(null, result);
    }

    this._sendMessage(method, args, function(result){
      if(result.status == "success"){
        success && success(result);
      }else{
        fail && fail(result);
      }
    });
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
  extend: function(funcs){
    for(var key in funcs){
      Efte[key] = funcs[key].bind(Efte);
    }
  }
};
