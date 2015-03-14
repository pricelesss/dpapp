var Efte = require('./core');

function notImplemented(opt){
  opt && opt.fail && opt.fail("ERR_NOT_IMPLEMENTED");
}


/**
 * Common
 * 基础功能，所有app都会用到
 */
Efte.extend({
  getUA: function(){
    return {
      platform: "web",
      appName: null,
      appVersion: null,
      deviceName: Efte._deviceUA.name,
      deviceVersion: Efte._deviceUA.version,
    };
  },
  ready: function(callback) {
    document.addEventListener("DOMContentLoaded", function(event) {
      callback();
    });
  },
  ajax: function(opts) {
    var METHOD_GET = "GET";
    var url = opts.url;
    var method = (opts.method || METHOD_GET).toUpperCase();
    var headers = opts.headers || {};
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
          fail && fail(xhr.statusText);
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
  getCityId: notImplemented,
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
  sendSMS: notImplemented,
  login: function(opts){
    require.async("easy-login", function(EasyLogin){

      var elem = document.createElement('div');
      var loginButton = document.createElement('input');
      loginButton.value = "login";
      loginButton.type = "button";

      elem.appendChild(loginButton);

      document.body.appendChild(elem);

      var myLogin = EasyLogin(elem, {
        platform: "mobile",  //平台， mobile or pc
        channel: "1"     //找账户中心申请的渠道ID
      });

      //处理Info信息
      myLogin.on("info",function(msg){
        console.log(msg);
      });

      //处理错误信息
      myLogin.on("error",function(msg){
        opts.fail && opts.fail();
      });

      //处理登录成功事件
      myLogin.on("login",function(){
        opts.success && opts.success();
        //do something here
      });

      loginButton.onclick = function(){
        myLogin.login(); //触发登录
      }

    });
  }
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
  setRLButton: notImplemented,
  setRRButton: notImplemented
});


/**
 * Broadcast
 */
var _events = {};
Efte.extend({
  subscribe: function(opts) {
    var name = opts.name;
    var success = opts.success;
    var handle = opts.handle;
    if(!handle){return;}
    if(_events[name]){
      _events[name].push(handle);
      success && success();
    }else{
      _events[name] = [handle];
    }
  },
  unsubscribe: function(opts){
    var name = opts.name;
    var success = opts.success;
    var handle = opts.handle;
    var events = _events;
    var funcs = events[name];
    if(!funcs){return}
    if(handle){
      var index = funcs.indexOf(handle);
      events[name] = funcs.splice(index,1);
    }else{
      delete events[name];
    }
  },
  publish: function(opts){
    var name = opts.name;
    var data = opts.data;
    var funcs = _events[name];
    funcs && funcs.forEach(function(func){
      func(data);
    });
  }
});

module.exports = Efte;