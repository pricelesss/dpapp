---
title: 点评Jsbridge v1.0.0

language_tabs:
  - javascript

toc_footers:
  - <a href='http://github.com/tripit/slate'>Documentation Powered by Slate</a>

includes:

search: true
---


# 概述
dpapp是用于主app的jsbridge，为web页面提供调用native功能的能力，同时检测客户端环境，使得在app之外的浏览器中也能够尽可能的实现相同功能，以避免一个功能产生多套代码。

# 引入

> cortex方式

```javascript
var DPApp = require('dpapp');
```

> 标签形式

在html代码中引入

```html
<script src="http://i2.dpfile.com/mod/dpapp/1.0.0/dpapp.js"></script>
```

dpapp模块支持通过Cortex通过CommonJS标准的方式引入，或者通过传统的script标签引入。

# 调用协议


```javascript
// 示例：调出分享界面
DPApp.ready(function(){
  DPApp.share({
    title:"分享标题",
    desc:"分享描述",
    image:"http://www.dpfile.com/toevent/img/aasd.png",
    url:"http://m.dianping.com",
    success: function(){
      alert('分享成功');
    },
    fail: function(e){
      alert(e.errMsg);
    }
  });
});
```

在开始之前，你可以选择配置DPApp，目前可选配置只有debug一个，表示是否开启调试模式。
`DPApp.config({debug:true})` 开启后会以alert的方式打印调试信息。默认为关闭。

DPApp默认开启校验，目前的校验规则基于域名，即只有在点评的域名下才可以使用jsbridge，包含 alpha.dp、 51ping.com、 dpfile.com、 dianping.com。可以在测试版的debug控制台中关闭校验。

所有若非特别说明，方法接受一个javascript对象作为参数，其中success，fail分别为成功与失败后的回调。
同时对于延时反馈的场景（如监听广播事件，按钮被点击的回调等），可以传入handle回调函数来处理。
回调函数接受一个json对象作为参数。对象中的字段含义如下：

- status: 代表业务执行结果，其值为 success（成功），fail（失败），action（被动回调）或 cancel（主动取消）
- result: 回调函数的执行结果，其值为 next（需要多次回调，执行后不销毁方法），error（执行错误），complete（执行成功）
- errMsg: 业务执行为fail时的错误信息

所有方法调用之前，需要使用DPApp.ready确保native已就绪。

#测试

手机连上内网wifi，前往http://app.dp/ 下载对应的app（需v7.0.1及以上）
在下方输入测试页面，使用app的扫码功能登录测试。

<p style="text-align:center">
<input id="test-url" style="width:300px;padding:5px" value="http://s2.51ping.com/s/res/dpapp/demo.html" />
<p>

<p id="test-canvas" style="text-align:center"></p>



如果使用模拟器调试，也可以通过进入`dianping://web?url=<your-test-url>`来测试webview

#接口说明

## 获取设备信息

```javascript
var ua = DPApp.getUA();
console.log(ua);
```
ua.platform 平台，dpapp|web
ua.appName app名称 目前只支持主app，值为dianping，web中为null
ua.appVersion app版本号，如：7.0.1
ua.deviceName 设备名 android|iphone
ua.deviceVersion 设备版本号 4.4.2|8.0.2

## 获取用户信息
```javascript
DPApp.getUserInfo({
  success: function(e){
    console.log(e.dpid); // 用户的dpid
    console.log(e.userId); // 用户id
    console.log(e.token); // 用户token
  }
});
```

## 获取诚信信息

```javascript
DPApp.getCX({
  business: "payorder", // 业务名
  success: function(e){
    console.log(e.cx);
  }
});
```

用于用户登录，支付等校验。目前可用的业务类型包括：
open，login，loginsuccess，cx，signup，payorder，createorder


## 获取城市信息

```javascript
DPApp.getCityId({
  success: function(e){
    console.log(e.cityId); // 切换城市
    console.log(e.locCityId); // 定位城市
  }
});
```

## 获取地理位置
```javascript
DPApp.getLocation({
  success: function(e){
    console.log(e.lat); // 纬度
    console.log(e.lng); // 经度
    console.log(e.type); // 坐标系类型
  }
});
```

## 获取网络状态
```javascript
DPApp.getNetworkType({
  success: function(e){
    console.log(e.networkType); // 2g, 3g, 4g, wifi
  }
});
```

## 获取联系人列表
```javascript
DPApp.getContactList({
  success: function(e){
    e.contactList.forEach(function(people){
      console.log(e.lastName); // 姓
      console.log(e.firstName); // 名
      console.log(e.phone); // 号码
    });
    console.log(e.authorized); // 用户是否授权
  }
});
```

## Ajax请求

```javascript
DPApp.ajax({
  url: "http://m.dianping.com/...bin",
  method: "post", // get 或 post，默认为get
  data: {}, // 请求数据
  keys: [
    "Deal",
    "ID",
    "Price"
  ], // 字段映射表
  success: function(data){
    console.log(data.Deal.ID);
    console.log(data.Deal.Price);
  }
});
```

对于DPObject的请求，由于后端返回的内容中，字段的key使用算法进行了非对称加密。

调用方需要与后端确认这些key，作为参数传入，使得方法可以映射出可读的字段。

在web中，业务方需要自行通过后端开放CORS等方式解决跨域问题。

## ga统计

```javascript
DPApp.ga({
  data: {},
  success: function(e){
  }
});
```

在web与native中都会将事件发送到hippo中。


## 上传图片

```javascript
DPApp.uploadImage({
  uploadUrl: "http://upload.url/path", // 上传图片调用的mapi接口的url
  extra: {}, // 业务参数
  compressFactor: 1024, // 上传图片压缩到多少尺寸以下，单位为K
  maxNum: 5,
  success: function(e){
    console.log(e.totalNum); // 图片上传张数
    console.log(e.image); // 原始图片结果
    console.log(e.progess); // start 开始上传, uploading 上传中, end 上传结束
  }
});
```

## 下载图片
```javascript
DPApp.downloadImage({
  imageUrl: "http://img5.douban.com/view/note/large/public/p22307117.jpg",
  success: function(){
    alert("下载成功")
  }
});
```
下载完成后，图片会出现在用户设备的资源库中。
web中没有此功能。


## 关闭webview
```javascript
DPApp.closeWindow();
```

## 第三方支付

```javascript
DPApp.pay({
  token: info.user.token, // 用户token
  orderId: orderId, // 订单号
  payType: payType, // 支付宝为1，微信为7
  cx: info.cx, // 诚信信息，由getCX接口获得
  success: function(data) {
    DPApp._log(JSON.stringify(data));
  },
  fail: function(data) {
    DPApp._log(JSON.stringify(data));
  }
});
```


## 分享
```javascript
DPApp.share({
  title:"分享标题",
  desc:"分享描述",
  content:"分享内容",
  image:"http://www.dpfile.com/toevent/img/16d05c85a71b135edc39d197273746d6.png",
  url:"http://m.dianping.com",
  feed: [DPApp.Share.WECHAT_FRIENDS, DPApp.Share.WECHAT_TIMELINE, DPApp.Share.WEIBO],
  success: function(){
    alert('分享成功');
  }
});
```

有些分享渠道包含标题和内容，有些只有内容。
对于只有内容的渠道，默认会拼接 title 和 desc 参数。
当设定了 content 参数时，则会直接使用该参数的取值。
feed包括需要展示的渠道，默认为所有渠道。
web中由于无法分享到微信，短信等，故只支持部分渠道。


## 发送短信
```javascript
DPApp.sendSMS({
  recipients: 13581887557,
  content: "短信内容",
  success: function(e){
  }
});
```

## 订阅消息
```javascript
DPApp.subscribe({
  action: 'loginSuccess',
  success: function(e){
    console.log("订阅成功");
  },
  handle: function(e){
    console.log("事件触发");
  }
});
```
默认广播类型包括
loginSuccess: 登录成功
switchCity: 切换城市
background: 应用切换到后台
foreground: 应用切换回前台

## 取消订阅
```javascript
DPApp.unsubscribe({
  action: 'loginSuccess',
  handle: func, // 取消特定订阅回调，不传则取消所有回调
  success: function(e){
    console.log("取消绑定")
  }
});
```

## 向native发布消息

```javascript
DPApp.publish({
  action: 'myMessage',
  success: function(){
    console.log("发送成功");
  }
});
```
注意，在web上因为没有native的参与，
所有方法实际行为都在web一端发生。
与传统的javascript sub/pub模式无异。

## 设置标题
```javascript
DPApp.setTitle({
  title: "标题"
});
```

## 设置导航栏按钮

> 右侧第一个

```javascript
DPApp.setRLButton({
  text: "文字",
  icon: "H5_Search",
  success: function(){
    console.log("设置成功");
  },
  handle: function(){
    console.log("按钮被点击");
  }
});
```


> 右侧第二个

```javascript
DPApp.setRRButton({
  text: "文字",
  icon: "H5_Share",
  success: function(){
    console.log("设置成功");
  },
  handle: function(){
    console.log("按钮被点击");
  }
});
```

文字按钮或者图片按钮。
icon属性定义了本地资源的名称，目前仅支持H5_Search、H5_Back、H5_Share
icon属性会覆盖text属性。



