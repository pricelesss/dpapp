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


var _events = {};
var patch7 = require('./patch-7.0');
var Patch = module.exports = {

ready : function(callback) {
  this._send("ready", {
    success: callback
  });
},

getNetworkType : function(opts) {
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

  this._send("getNetworkType", {
    success: function(result) {
      var ua = this.getUA();
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
},

share : function(opts) {
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
},

subscribe : function(opts) {
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  if (_events[name]) {
    opts.success && opts.success();
    _events[name].push(handle);
  } else {
    this._send("subscribe", {
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
},

unsubscribe : function(opts) {
  var name = opts.action;
  var success = opts.success;
  var handle = opts.handle;

  var index = _events[name] ? _events[name].indexOf(handle) : -1;
  if (index != -1) {
    _events[name].splice(index, 1);
    success && success();
  } else {
    this._send("unsubscribe", {
      action: name,
      success: success
    });
  }
},

pay : patch7.pay,

ajax : function(args) {
  args = this._sanitizeAjaxOpts(args);
  var _success = args.success;
  args.success = function(e) {
    var result = JSON.parse(e.mapiResult);
    result = this._transModel(args.keys, result);
    _success(result);
  };

  this._send("mapi", args);
},


uploadImage : function(opts){
  var success = opts.success;
  var fail = opts.fail;
  var handle = opts.handle;

  this._sendMessage("uploadImage", opts, function(result){
    var status = result.status;
    if(status == "fail"){
      fail && fail(result);
      return;
    }else{
      handle && handle(result);
    }
  });
},


login : function(opts) {
  var self = this;
  function getUser(callback) {
    self.getUserInfo({
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
        this.unsubscribe({
          "action": "loginSuccess",
          handle: handler
        });
      };
      this.subscribe({
        action: "loginSuccess",
        handle: handler
      });

      this.openScheme({
        url: "dianping://login"
      });
    }
  });
}

};


apis.forEach(function(name) {
  Patch[name] = function(options) {
    this._send(name, options);
  }
});


(function() {
  var uastr = navigator.userAgent;
  var appVersionMatch = uastr.match(/dp\/[\w\.\d]+\/([\d\.]+)/);
  appVersion = appVersionMatch && appVersionMatch[1];

  Patch.getUA = function(opt) {
    var result = {};
    var success = opt && opt.success;
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: this._osUA.name,
      osVersion: this._osUA.version
    };
    success && success(ua);
    return ua;
  };
})();