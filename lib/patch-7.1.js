var apis = require('./apilist');

var _events = {};
var patch7 = require('./patch-7.0');
var core = require('./core');
var getUA = (function(){
  var uastr = navigator.userAgent;
  var appVersionMatch = uastr.match(/dp\/[\w\.\d]+\/([\d\.]+)/);
  var appVersion = appVersionMatch && appVersionMatch[1];
  return function(opt) {
    var result = {};
    var success = opt && opt.success;
    var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: core._osUA.name,
      osVersion: core._osUA.version
    };
    success && success(ua);
    return ua;
  };
})();

var ua = getUA();

var is7_1 = core.Semver.lt(ua.appVersion, "7.2.0");

var Patch = module.exports = {
getUA: getUA,
ready : function(callback) {
  var self = this;
  this._send("ready", {
    success: function(){
      self._isReady = true;
      callback();
    }
  });
},
_iOSNetworkType: function (result) {
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
  var type = +result.type;
  var subType = result.subType;
  var returnValue;
  // 2g, 3g, 4g
  function getMobileType(subType) {
    switch (subType) {
      case "CTRadioAccessTechnologyGPRS":
      case "CTRadioAccessTechnologyEdge":
      case "CTRadioAccessTechnologyCDMA1x":
        return "2g";
      case "CTRadioAccessTechnologyLTE":
        return "4g";
      case "CTRadioAccessTechnologyWCDMA":
      case "CTRadioAccessTechnologyHSDPA":
      case "CTRadioAccessTechnologyHSUPA":
      case "CTRadioAccessTechnologyCDMA1x":
      case "CTRadioAccessTechnologyCDMAEVDORev0":
      case "CTRadioAccessTechnologyCDMAEVDORevA":
      case "CTRadioAccessTechnologyCDMAEVDORevB":
      case "CTRadioAccessTechnologyeHRPD":
        return "3g";
    }
  }

  if ((type & types.kSCNetworkReachabilityFlagsReachable) == 0) {
    return "none";
  }

  if ((type & types.kSCNetworkReachabilityFlagsConnectionRequired) == 0) {
    // if target host is reachable and no connection is required
    //  then we'll assume (for now) that your on Wi-Fi
    returnValue = "wifi";
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
      returnValue = "wifi";
    }
  }

  if ((type & types.kSCNetworkReachabilityFlagsIsWWAN) == types.kSCNetworkReachabilityFlagsIsWWAN) {
    // ... but WWAN connections are OK if the calling application
    //     is using the CFNetwork (CFSocketStream?) APIs.
    returnValue = getMobileType(subType);
  }

  return returnValue;
},
_androidNetworkType: function (result) {
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
},
getNetworkType : function(opt) {
  var _success = opt.success;

  this._send("getNetworkType", {
    success: function(result) {
      var ua = this.getUA();
      var networkType;
      switch (ua.osName) {
        case "iphone":
          networkType = this._iOSNetworkType(result);
          break;
        case "android":
          networkType = this._androidNetworkType(result);
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
    fail: opt.fail
  });
},

share : function(opt) {
  opt.feed = this._parseFeed(opt.feed);
  this._send("share", opt);
},

initShare: function(opt){
  var self = this;
  this.setRRButton({
    icon:"H5_Share",
    handle: function(){
      self.share({
        title: opt.title,
        desc: opt.desc,
        content: opt.content,
        image: opt.image,
        feed: opt.feed,
        url: opt.url,
        success: opt.success,
        fail: opt.fail
      });
    }
  });
},

subscribe : function(opt) {
  var name = opt.action;
  var success = opt.success;
  var handle = opt.handle;

  if (_events[name]) {
    opt.success && opt.success();
    _events[name].push(handle);
  } else {
    this._send("subscribe", {
      action: name,
      success: opt.success,
      handle: function() {
        _events[name].forEach(function(func) {
          func();
        });
      }
    });
    _events[name] = [handle];
  }
},

unsubscribe : function(opt) {
  var name = opt.action;
  var success = opt.success;
  var handle = opt.handle;

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


uploadImage : function(opt){
  var success = opt.success;
  var fail = opt.fail;
  var handle = opt.handle;

  this._sendMessage("uploadImage", opt, function(result){
    var status = result.status;
    if(status == "fail"){
      fail && fail(result);
      return;
    }else{
      handle && handle(result);
    }
  });
},

openScheme: function(opt){
  var url = opt.url;
  var extra = opt.extra;
  if(extra){
    url += "?" + this._convertUrlParams(extra);
    delete opt.extra;
    opt.url = url;
  }
  this._send('openScheme', opt);
},

jumpToScheme: is7_1 ? core._notImplemented : function(opt){
  var url = opt.url;
  var extra = opt.extra;
  if(extra){
    url += "?" + this._convertUrlParams(extra);
    delete opt.extra;
    opt.url = url;
  }
  opt.toHome = !!opt.toHome ? 1 : 0;
  this._send('jumpToScheme', opt);
},

_getBizName: function(opt, callback){
  var fail = opt.fail;
  var bizname = this._cfg.bizname;
  if(!bizname){
    fail && fail("use `DPApp.config({bizname:'<your-bizname>'})` first");
    return false;
  }else{
    return bizname;
  }
},

store: is7_1 ? core._notImplemented : function(opt){
  var bizname = this._getBizName(opt);
  if(bizname){
    opt.key = bizname + ":" + opt.key;
    this._send("store", opt);
  }
},

retrieve: is7_1 ? core._notImplemented : function(opt){
  var bizname = this._getBizName(opt);
  if(bizname){
    opt.key = bizname + ":" + opt.key;
    this._send("store", opt);
  }
},

publish: function(opt){
  if(is7_1){
    return this._send("publish", opt);
  }

  var bizname = this._getBizName(opt);
  var CONSTS = ["phoneChanged", "AccountBindChange"];
  if(bizname){
    if(CONSTS.indexOf(opt.action) == -1){
      opt.action = bizname + ":" + opt.action;
    }
    this._send("publish", opt);
  }
},

login : function(opt) {
  var self = this;
  function getUser(callback) {
    self.getUserInfo({
      success: callback
    });
  }
  getUser(function(result) {
    if (result.token) {
      opt.success && opt.success(result);
    } else {
      var handler = function() {
        getUser(function(result) {
          opt.success && opt.success(result);
        });
        this.unsubscribe({
          "action": "loginSuccess",
          handle: handler
        });
      };
      self.subscribe({
        action: "loginSuccess",
        handle: handler
      });

      self.openScheme({
        url: "dianping://login"
      });
    }
  });
}

};

apis.forEach(function(name) {
  if(!Patch[name]){
    Patch[name] = function(options) {
      this._send(name, options);
    }
  }
});