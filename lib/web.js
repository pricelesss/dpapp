var Efte = require('./core');

function notImplemented(opt){
  opt && opt.fail && opt.fail("ERR_NOT_IMPLEMENTED");
}

function alternative(name){
  return function(opt){
    alert('在web请使用' + name);
    notImplemented(opt);
  }
}

/**
 * Common
 * 基础功能，所有app都会用到
 */
Efte.extend({
  ready: function(callback) {
    document.addEventListener("DOMContentLoaded", function(event) {
      callback();
    });
  },
  ajax: function(opts) {
    var METHOD_GET = "GET";
    var url = opt.url;
    var method = (opts.method || METHOD_GET).toUpperCase();
    var headers = opt.headers || {};
    var data = opts.data;
    var success = opts.success;
    var fail = opts.fail;

    xhr = new XMLHttpRequest();

    if(!url){
      url = location.href.split("?")[0];
    }

    if(method === METHOD_GET && data){
      url += parseQuery(data);
      data = null;
    }

    if(method !== METHOD_GET){
      xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    }

    function parseQuery(data){
      var queryString = "";
      for(var key in data){
        queryString +=  key + '=' + encodeURIComponent(data[key])
      }
      return queryString;
    }

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) { // ready
        xhr.onreadystatechange = function() {};
        var result, error = false;
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
          result = xhr.responseText;

          try {
            result = /^\s*$/.test(result) ? null : JSON.parse(result);
          } catch (e) {
            error = e;
          }

          if (error) fail && fail('ERR_PARSE_JSON');
          else success(result);
        } else {
          ajaxError && ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings);
        }
      }
    };

    xhr.open(opts.method, url, true, opts.username, opts.password);
    for(var name in headers){
      xhr.setRequestHeader(name, headers[name]);
    }
    xhr.send(data);
  },
  ga: function(opts) {

  },
  // ImagePicker: ImagePicker,
  chooseImage: alternative('Efte.ImagePicker'),
  uploadImage: function(){

  },
  downloadImage: notImplemented,
  closeWindow: function(){
    window.close();
  }
});

/**
 * Infos
 */
Efte.extend({
  getLocation: function(opts) {
    var success = opts.success;
    var fail = opts.fail;
    navigator.geolocation.getCurrentPosition(function(position){
      success && success({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    },function(){
      fail && fail("ERR_GET_LOCATION");
    });
  },
  // 无法完美实现就不实现
  getNetworkType: notImplemented,
  getUserInfo: notImplemented,
  getContactList: notImplemented,
  getCX: notImplemented
});

/**
 * Funcs
 */
Efte.extend({
  pay: function(opts) {
    // 找文东
  },
  share: function(opts) {
    //
  },
  sendSMS: notImplemented
});

/**
 * UI
 */
Efte.extend({
  setTitle: function(opts) {
    var title = opts.title;
    if(title){
      window.title = title;
    }
  },
  setLeftButton: notImplemented,
  setRightButton: notImplemented
});

module.exports = Efte;