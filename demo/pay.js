(function(){

  // 支付
  function series(steps, callback){
    var count = steps.length;
    var results = [];
    function done(err, result){
      if(err){
        return callback(err);
      }else{
        results.push(result);
        steps.count--;
        steps.shift();
        if(steps.length){
          steps[0](done);
        }else{
          callback(null, results);
        }
      }
    }
    steps[0](done);
  }

  function getBaseInfo(callback){
    var info = {};
    series([
      function(done){
        DPApp.getUserInfo({
          success: function(user){
            done(null, user);
          },
          fail: function(){
            done("fail get user");
          }
        });
      },
      function(done){
        DPApp.getCityId({
          success: function(result){
            done(null, result.cityId);
          },
          fail: function(){
            done("fail get cityId");
          }
        });
      },
      function(done){
        DPApp.getCX({
          businessType: "payorder",
          success: function(result){
            done(null, result.cx);
          },
          fail: function(){
            done("fail get cx");
          }
        });
      }
    ], function(err, result){
      if(err){return callback(err);}
      callback(null, {
        user: result[0],
        cityId: result[1],
        cx: result[2]
      });
    });
  }

  function getTuangouDeal(data, callback){
    DPApp.ajax({
      url: 'http://app.t.dianping.com/dealgn.bin',
      data: data,
      keys: [
        "Deal",
        "ID",
        "Price",
        "DealSelectList"
      ],
      success: function(deal) {
        callback(null , deal);
      },
      fail: function(){
        callback("fail get tuangou deal");
      }
    });
  }

  function loopQuery(paymentinfo, callback){

    var count = paymentinfo.RetryCount;

    function takeATry(){
        DPApp.ajax({
            url:"http://api.p.dianping.com/getsubmitorderresult.pay",
            data:{
                advanceorderid: paymentinfo.AdvanceOrderId
            },
            keys:["OrderId","Status","ErrorMsg"],
            success: function(data){
                if(data.Status == 1){
                    callback(null, {
                        ID: data.OrderId
                    });
                }else if(data.Status == 0){
                    callback(data.ErrorMsg);
                }else{
                    count--;
                    if(count == 0){
                        callback("fail loop query");
                    }else{
                        setTimeout(takeATry, paymentinfo.IntervalTime);
                    }
                }
            }
        });
    }
    takeATry();
  }

  function createOrder(data, callback){
    DPApp.getCX({
      businessType: "createorder",
      success: function(result){
        data.cx = result.cx;
        DPApp.ajax({
          url: 'http://app.t.dianping.com/createordergn.bin',
          data: data,
          keys: [
            "PaymentInfo",
            "AdvanceOrderId",
            "RetryCount",
            "IntervalTime",
            "DiscountList",
            "Balance",
            "PaymentType",
            "ID",
            "Flag",
            "AlertMsg"
            ],
          success: function (paymentinfo) {
            if(paymentinfo.ID == 0){
              // 轮训
              loopQuery(paymentinfo, callback);
            }else{
              callback(null, paymentinfo);
            }
          },
          fail: function (error) {
            callback("fail create order");
          }
        });
      },
      fail: function(){
        callback("fail create order");
      }
    });
  }

  $('pay').onclick = function(){
    var payType = 7;
    var info, deal, order;
    var paymsg;
    series([
      function(done){
        getBaseInfo(function(err, result){
          if(err){return done(err);}
          info = result;
          done(null);
        });
      },
      function(done){
        getTuangouDeal({
          id: 6191069,
          cityid: info.cityId,
          token: info.user.token
        },function(err, result){
          if(err){return done(err);}
          deal = result;
          done(null);
        });
      },
      function(done){
        createOrder({
          groupid: deal.ID,
          dealid: deal.DealSelectList[0].ID,
          token: info.user.token,
          cityid: info.cityId,
          count: 1,
          paymentamount: deal.Price
        }, function(err, result){
          if(err){return done(err);}
          order = result;
          done(null);
        });
      }
    ], function(err){
      if(err){
        return DPApp.log(err);
      }else{
        DPApp.pay({
          token: info.user.token,
          orderId: order.ID,
          payType: payType,
          cx: info.cx,
          success: function(data) {
            DPApp.log(JSON.stringify(data));
          },
          fail: function(data) {
            DPApp.log(JSON.stringify(data));
          }
        });
      }
    });
	}
})();