module.exports = function(Efte){
var apis = [
  /**
   * Infos
   */
  "getUserInfo", "getCityId", "getLocation", "getContactList", "getCX",
  /**
   * Common
   */
  "getRequestId", "downloadImage", "closeWindow", /* getNetworkType, share */
  /**
   * Funcs
   */
  "sendSMS", "openScheme", /* ajax */
  /**
   * Broadcast
   */
  "publish", /* subscribe, unsubscribe, login */
  /**
   * UI
   */
  "setTitle", "setLLButton", "setLRButton", "setRLButton", "setRRButton"
];

apis.forEach(function(name) {
  Efte[name] = function(options) {
    this._send(name, options);
  }
});

// Efte.NetworkType = {
//   IOS_

// };

Efte.ready = function(callback) {
  Efte._send("ready", {
    success: callback
  });
};

Efte.getNetworkType = function(opts) {
  var _success = opts.success;

  function iOSNetworkType(result) {
    var networkType;
    var types = {
      kSCNetworkReachabilityFlagsTransientConnection: 1 << 0,
      kSCNetworkReachabilityFlagsReachable: 1 << 1,
      kSCNetworkReachabilityFlagsConnectionRequired: 1 << 2,
      kSCNetworkReachabilityFlagsConnectionOnTraffic: 1 << 3,
      kSCNetworkReachabilityFlagsInterventionRequired: 1 << 4,
      kSCNetworkReachabilityFlagsConnectionOnDemand: 1 << 5,
      kSCNetworkReachabilityFlagsIsLocalAddress: 1 << 16,
      kSCNetworkReachabilityFlagsIsDirect: 1 << 17,
      kSCNetworkReachabilityFlagsIsWWAN: 1 << 18
    };
    var type = result.type;
    var subType = result.subType;

    // 2g, 3g, 4g
    function getMobileType(subType) {
      switch (subType) {
        case "CTRadioAccessTechnologyGPRS":
          ;
        case "CTRadioAccessTechnologyEdge":
          ;
        case "CTRadioAccessTechnologyCDMA1x":
          ;
          return "2g";
        case "CTRadioAccessTechnologyLTE":
          return "4g";
          // case "CTRadioAccessTechnologyWCDMA"
          // case "CTRadioAccessTechnologyHSDPA"
          // case "CTRadioAccessTechnologyHSUPA"
          // case "CTRadioAccessTechnologyCDMA1x"
          // case "CTRadioAccessTechnologyCDMAEVDORev0"
          // case "CTRadioAccessTechnologyCDMAEVDORevA"
          // case "CTRadioAccessTechnologyCDMAEVDORevB"
          // case "CTRadioAccessTechnologyeHRPD"
          return "3g";
      }
    }

    if ((type & types.kSCNetworkReachabilityFlagsReachable) == 0) {
      return "none";
    }

    if ((type & types.kSCNetworkReachabilityFlagsConnectionRequired) == 0) {
      // if target host is reachable and no connection is required
      //  then we'll assume (for now) that your on Wi-Fi
      return "wifi";
    }


    if (
      (type & types.kSCNetworkReachabilityFlagsConnectionOnDemand) != 0
      ||
      (type & types.kSCNetworkReachabilityFlagsConnectionOnTraffic) != 0
    ) {
      // ... and the connection is on-demand (or on-traffic) if the
      //     calling application is using the CFSocketStream or higher APIs
      if ((type & types.kSCNetworkReachabilityFlagsInterventionRequired) == 0) {
        // ... and no [user] intervention is needed
        return "wifi";
      }
    }

    if ((type & types.kSCNetworkReachabilityFlagsIsWWAN) == types.kSCNetworkReachabilityFlagsIsWWAN) {
      // ... but WWAN connections are OK if the calling application
      //     is using the CFNetwork (CFSocketStream?) APIs.
      return getMobileType(type);
    }

    return "none";
  }

  function androidNetworkType(result) {
    var type = result.type;
    var subType = result.subType;

    if (type == 0) {
      switch (subType) {
        case 1:
        case 2:
        case 4:
        case 7:
        case 11:
          return "2g";
        case 3:
        case 5:
        case 6:
        case 8:
        case 9:
        case 10:
        case 12:
        case 14:
        case 15:
          return "3g";
        case 13:
          return "4g";
      }
    }

    if (type == 1) {
      return "wifi";
    } else {
      return "none";
    }
  }

  Efte._send("getNetworkType", {
    success: function(result) {
      var ua = Efte.getUA();
      var networkType;
      switch (ua.osName) {
        case "iphone":
          networkType = iOSNetworkType(result);
          break;
        case "android":
          networkType = androidNetworkType(result);
          break;
      }

      _success && _success({
        networkType: networkType,
        raw: {
          type: result.type,
          subType: result.subType
        }
      });
    },
    fail: opts.fail
  });
}

Efte.share = function(opts) {
  if (!opts.feed) {
    opts.feed = 0xff;
  } else if (opts.feed.constructor.toString().indexOf("Array") >= 0) {
    var feed = [0, 0, 0, 0, 0, 0, 0, 0];
    opts.feed.forEach(function(pos) {
      feed[7 - pos] = 1;
    });
    opts.feed = parseInt(feed.join(""), 2);
  }

  this._send("share", opts);
}

var _events = {};
Efte.subscribe = function(opts) {
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  if (_events[name]) {
    opts.success && opts.success();
    _events[name].push(handle);
  } else {
    Efte._send("subscribe", {
      action: name,
      success: opts.success,
      handle: function() {
        _events[name].forEach(function(func) {
          func();
        });
      }
    });
    _events[name] = [handle];
  }
}

Efte.unsubscribe = function(opts) {
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  var index = _events[name] ? _events[name].indexOf(handle) : -1;
  if (index != -1) {
    _events[name].splice(index, 1);
    success && success();
  } else {
    Efte._send("unsubscribe", {
      action: name,
      success: success
    });
  }
}

Efte.pay = function(args) {
  var payType = args.payType;
  var success = args.success;
  var fail = args.fail;
  var cx = args.cx;

  function payOrder(data, callback) {
    DPApp.ajax({
      url: 'http://api.p.dianping.com/payorder.pay',
      data: data,
      keys: ["Content"],
      success: function(paymsg) {
        callback(null, paymsg);
      },
      fail: function(fail) {
        callback("fail payorder");
      }
    });
  }

  function getPaymentTool(payType) {
    var PAY_TYPE_MINIALIPAY = 1;
    var PAY_TYPE_WEIXINPAY = 7;
    var PAYMENTTOOL_ALIPAY = "5:1:null#219#0";
    var PAYMENTTOOL_WEIXINPAY = "11:1:null#217#0";
    if (payType == PAY_TYPE_WEIXINPAY) {
      paymentTool = PAYMENTTOOL_WEIXINPAY;
    } else {
      paymentTool = PAYMENTTOOL_ALIPAY;
    }
    return paymentTool;
  }

  payOrder({
    token: args.token,
    orderid: args.orderId,
    paymenttool: getPaymentTool(payType),
    cx: cx
  }, function(err, paymsg) {
    if (err) {
      return fail && fail(err);
    }

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

Efte.ajax = function(args) {
  args = Efte._sanitizeAjaxOpts(args);
  var _success = args.success;
  args.success = function(e) {
    var result = JSON.parse(e.mapiResult);
    result = Efte._transModel(args.keys, result);
    _success(result);
  };

  Efte._send("mapi", args);
};

(function() {
  var uastr = navigator.userAgent;
  var appVersionMatch = uastr.match(/dp\/[\w\.\d]+\/([\d\.]+)/);
  appVersion = appVersionMatch && appVersionMatch[1];

  Efte.getUA = function(opt) {
    var result = {};
    var success = opt && opt.success;
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: Efte._osUA.name,
      osVersion: Efte._osUA.version
    };
    success && success(ua);
    return ua;
  };
})();

Efte.uploadImage = function(opts){
  var success = opts.success;
  var fail = opts.fail;
  var handle = opts.handle;

  this._sendMessage("uploadImage", opts, function(result){
    var status = result.status;
    if(status == "fail"){
      fail && fail(result);
      return;
    }else if(status == "success"){
      success && success(result);
      return;
    }else if(status == "action"){
      handle && handle(result);
    }
  });
};


Efte.login = function(opts) {

  function getUser(callback) {
    Efte.getUserInfo({
      success: callback
    });
  }
  getUser(function(result) {
    if (result.token) {
      opts.success && opts.success(result);
    } else {
      var handler = function() {
        getUser(function(result) {
          opts.success && opts.success(result);
        });
        Efte.unsubscribe({
          "action": "loginSuccess",
          handle: handler
        });
      };
      Efte.subscribe({
        action: "loginSuccess",
        handle: handler
      });

      Efte.openScheme({
        url: "dianping://login"
      });
    }
  });
}

}