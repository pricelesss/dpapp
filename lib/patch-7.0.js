var core = require('./core');
var patch6 = require('./patch-6.x');
var Patch = module.exports = core._mixin(patch6, {
	getUA : function(opt){
		var result = {};
  	var success = opt && opt.success;
  	var appVersion = navigator.userAgent.match(/MApi\s[\w\.]+\s\([\w\.\d]+\s([\d\.]+)/)[1];
  	var ua = {
      platform: "dpapp",
      appName: "dianping",
      appVersion: appVersion,
      osName: this._osUA.name,
      osVersion: this._osUA.version
    };
  	success && success(ua);
    return ua;
	},
  ready: function(callback){
    callback();
  },
  Share: core.Share,
  pay: function(args){
    var self = this;
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


      self._sendMessage('pay', {
        paytype: payType,
        paycontent: paymsg.Content
      }, function(data) {
        if (data.payresult) {
          success && success(data);
        } else {
          fail && fail(data);
        }
      });
    });
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

  closeWindow : function(){
    this._sendMessage('close_web');
  }
});