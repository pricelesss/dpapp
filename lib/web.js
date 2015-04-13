var core = require('./core');
var apis = require('./apilist');
var logincss = require('./login.css.js');
var notImplemented = core._notImplemented;

var core = core._mixin({}, core);

/**
 * Common
 * 基础功能，所有app都会用到
 */
 core.extend({
  getUA: function(opt){
    var success = opt && opt.success;
    var ua = {
      platform: "web",
      appName: null,
      appVersion: null,
      osName: core._osUA.name,
      osVersion: core._osUA.version
    };
    success && success(ua);
    return ua;
  },
  ready: core._bindDOMReady,
  ajax: function(opts) {
    var METHOD_GET = "GET";
    var url = opts.url;
    var method = (opts.method || METHOD_GET).toUpperCase();
    var headers = opts.headers || {};
    var data = opts.data;
    var success = opts.success;
    var fail = opts.fail;

    var xhr = new XMLHttpRequest();

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
  closeWindow: function(){
    window.close();
  }
});

/**
 * Infos
 */
core.extend({
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
  getCityId: function(opt){
    var cityId = document.cookie.match(/cy=(\d+)/);
    cityId = cityId ? +cityId[1] : null;
    opt && opt.success && opt.success({
      cityId: cityId
    });
  },
});

/**
 * Funcs
 */
core.extend({
  pay: function(opts) {
    // 找文东
  },
  share: function(opts) {
    var success = opts.success;
    var handle = opts.handle;

    var title = opts.title;
    var desc = opts.desc;
    var content = opts.content;
    var pic = opts.image;
    var url = opts.url;

    require.async("dpapp-share", function(share){
      share.pop({
        title: title,
        desc: desc,
        content: content,
        pic: pic,
        url: url
      });
      success && success();
    });
  },
  sendSMS: notImplemented,
  login: function(opts){
    var styleTag;
    require.async("easy-login", function(EasyLogin){
      if(!styleTag){
        styleTag = document.createElement('style');
        styleTag.setAttribute('type','text/css');
        styleTag.innerHTML = logincss;
        document.getElementsByTagName('head')[0].appendChild(styleTag);
      }
      var elem = document.createElement('div');
      var loginButton = document.createElement('input');
      elem.setAttribute('class','dpapp-login-panel');
      loginButton.value = "登录";
      loginButton.type = "button";
      loginButton.setAttribute('class','login-btn');

      document.body.appendChild(elem);

      var myLogin = EasyLogin(elem, {
        platform: "mobile",  //平台， mobile or pc
        channel: opts.channel || "1"     //找账户中心申请的渠道ID
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
        elem.parentNode.removeChild(elem);
        //do something here
      });
      elem.appendChild(loginButton);
      loginButton.onclick = function(){
        myLogin.login(); //触发登录
      }



    });
  }
});

/**
 * UI
 */
core.extend({
  setTitle: function(opts) {
    var title = opts.title;
    if(title){
      document.title = title;
    }
  }
});


/**
 * Broadcast
 */
var _events = {};
core.extend({
  subscribe: function(opts) {
    if(!opts.action){return;}
    var name = opts.action;
    var success = opts.success;
    var handle = opts.handle;
    if(!handle){return;}
    if(_events[name]){
      _events[name].push(handle);
    }else{
      _events[name] = [handle];
    }
    success && success();
  },
  unsubscribe: function(opts){
    if(!opts.action){return;}
    var name = opts.action;
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
    success && success();
  },
  publish: function(opts){
    if(!opts.action){return;}
    var name = opts.action;
    var data = opts.data;
    var funcs = _events[name];
    funcs && funcs.forEach(function(func){
      func(data);
    });
    success && success();
  }
});


apis.forEach(function(name){
  if(!core[name]){
    core[name] = notImplemented;
  }
});


module.exports = core;