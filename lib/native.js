var Efte = require('./core');

[
/**
 * Infos
 */
"getUserInfo", "getCityId", "getLocation", "getNetworkType", "getContactList", "getCX",
/**
 * Common
 */
"getRequestId", "uploadImage", "downloadImage", "closeWindow",
/**
 * Funcs
 */
 "sendSMS", "openScheme",
/**
 * Broadcast
 */
 "unsubscribe", "publish",
/**
 * UI
 */
"setTitle", "setLLButton", "setLRButton", "setRLButton", "setRRButton"
].forEach(function(name){
  Efte[name] = function(options){
    this._send(name, options);
  }
});

// Efte.NetworkType = {
//   IOS_

// };

Efte.login = function(opts){

  function getUser(callback){
    Efte.getUserInfo({
      success: callback
    });
  }
  getUser(function(result){
    if(result.token){
      opts.success && opts.success("登录成功");
    }else{
      Efte.subscribe({
        action: "loginSuccess",
        handle: function(){
          opts.success && opts.success("登录成功");
          Efte.unsubscribe({"action":"loginSuccess"});
        }
      });

      Efte.openScheme({
        url: "dianping://login"
      });
    }
  });
}

Efte.ready = function(callback){
  Efte._send("ready", {
    success: callback
  });
};

Efte.share = function(opts){
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

var _events = {};
Efte.subscribe = function(opts){
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  if(_events[name]){
    opts.success && opts.success();
    _events[name].push(handle);
  }else{
    Efte._send("subscribe", {
      action: name,
      success: opts.success,
      handle: function(){
        _events[name].forEach(function(func){
          func();
        });
      }
    });
    _events[name] = [handle];
  }
}

Efte.unsubscribe = function(opts){
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  var index = _events[name] ? _events[name].indexOf(handle) : -1;
  if(index != -1){
    _events[name].splice(index, 1);
    success && success();
  }else{
    Efte._send("unsubscribe",{
      action: name,
      success: success
    });
  }
}

Efte.pay = function(args){
  var payType = args.payType;
  var success = args.success;
  var fail = args.fail;
  var cx = args.cx;

  function payOrder(data, callback){
    DPApp.ajax({
      url: 'http://api.p.dianping.com/payorder.pay',
      data: data,
      keys: ["Content"],
      success: function (paymsg) {
        callback(null, paymsg);
      },
      fail: function(fail){
        callback("fail payorder");
      }
    });
  }

  function getPaymentTool(payType){
    var PAY_TYPE_MINIALIPAY = 1;
    var PAY_TYPE_WEIXINPAY = 7;
    var PAYMENTTOOL_ALIPAY = "5:1:null#219#0";
    var PAYMENTTOOL_WEIXINPAY = "11:1:null#217#0";
    if (payType == PAY_TYPE_WEIXINPAY) {
      paymentTool = PAYMENTTOOL_WEIXINPAY;
    }else{
      paymentTool = PAYMENTTOOL_ALIPAY;
    }
    return paymentTool;
  }

  payOrder({
    token: args.token,
    orderid: args.orderId,
    paymenttool: getPaymentTool(payType),
    cx: cx
  }, function(err, paymsg){
    if(err){return fail && fail(err);}

    Efte._send("pay", {
      paytype: payType,
      paycontent: paymsg.Content,
      success: function(data) {
        DPApp._log(JSON.stringify(data));
      },
      fail: function(data) {
        DPApp._log(JSON.stringify(data));
      }
    });
  });
}

Efte.ajax = function(args){
  args.method = args.method || "get";
  args.data = args.data || "";
  var url = args.url;
  var data = args.data;
  var isDPObject = !!args.keys;

  var keymap = {};

  function getHash(str){
    hashCode = function(str) {
      var hash = 0, i, chr, len;
      if (str.length == 0) return hash;
      for (i = 0, len = str.length; i < len; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    };

    var i = hashCode(str);
    return "0x" + ((0xFFFF & i) ^ (i >>> 16)).toString(16);
  }

  function generateKeys(keys){
    keys.forEach(function(key){
      keyMap[getHash(key)] = key;
    });
  }

  function isArray(val){
    return Object.prototype.toString.call(val) == "[object Array]";
  }

  function isObject(val){
    return Object.prototype.toString.call(val) == "[object Object]";
  }


  function translate(obj) {
    if(isObject(obj)){
      delete obj.__name;
      for(var key in obj){
        var val;
        if(keymap[key]){
          val = obj[keymap[key]] = obj[key];
          translate(val, keymap);
          delete obj[key];
        }
      }
    }else if(isArray(obj)){
      obj.forEach(function(item){
        translate(item);
      });
    }
    return obj;
  }

  if(isDPObject){
    args.keys.forEach(function(key){
      keymap[getHash(key)] = key;
    });
  }

  if(args.method == "get"){
    var params = [];
    for (var p in data) {
      if (data[p]) {
        params.push(p + '=' + encodeURIComponent(data[p]));
      }
    }

    if (params.length) {
      url += url.indexOf('?') == -1 ?  "?" : "&";
      url += params.join('&');
    }
    args.url = url;
    delete args.data;
  }
  var _success = args.success;
  args.success = function(e){
    var result = JSON.parse(e.mapiResult);
    if(isDPObject){
      result = translate(result);
    }
    _success(result);
  };

  Efte._send("mapi", args);
};

(function(){
  var uastr = navigator.userAgent;
  var appVersionMatch = uastr.match(/dp\/[\w\.\d]+\/([\d\.]+)/);
  appVersion = appVersionMatch && appVersionMatch[1];

  Efte.getUA = function(opt){
  	var result = {};
  	var success = opt && opt.success;
  	var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      deviceName: Efte._deviceUA.name,
      deviceVersion: Efte._deviceUA.version
    };
  	success && success(ua);
    return ua;
  };
})();



/**
 * Efte has to be exposed to window
 * so that Efte.callback could be called with jsbridge
 */
module.exports = Efte;