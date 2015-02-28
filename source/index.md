---
title: 点评Jsbridge v1.0.0

language_tabs:
  - javascript

toc_footers:
  - <a href='#'>Sign Up for a Developer Key</a>
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


所有方法皆只接受一个javascript对象作为参数，其中success，fail分别为成功与失败后的回调。
回调函数接受一个json对象作为参数。对象中的字段含义如下：

- status: 代表业务执行结果，其值为 success（成功），fail（失败）或 cancel（主动取消）
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

## 获取地理位置
```javascript
DPApp.getUserInfo({
  success: function(e){
    console.log(e.lat); // 纬度
    console.log(e.lng); // 经度
    console.log(e.type); // 坐标系类型
  }
});
```

## 获取网络状态
```javascript
DPApp.getUserInfo({
  success: function(e){
    console.log(e.networkType); // 2g, 3g, 4g, wifi
  }
});
```

## 获取联系人列表
```javascript
DPApp.getContactList({
  success: function(e){
    console.log(e.contactList); // 联系人列表
    console.log(e.authorized); // 用户是否授权
  }
});
```

## Ajax请求
```javascript
DPApp.ajax({
  url: "http://m.dianping.com/...",
  method: "post", // get 或 post
  data: {}, // 请求数据
  cacheType: 1, //
  success: function(e){
    console.log(e.data); // 联系人列表
  }
});
```

## ga统计
```javascript
DPApp.ga({
  success: function(e){
    console.log(e.contactList); // 联系人列表
    console.log(e.authorized); // 用户是否授权
  }
});
```


## 上传图片

```javascript
DPApp.uploadImage({
  uploadUrl: "", // 上传图片调用的mapi接口的url
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
  }
});
```

## 关闭webview
```javascript
DPApp.closeWindow();
```

## 第三方支付
待补充
```javascript
DPApp.pay({

});
```


## 分享
有些分享渠道包含标题和内容，有些只有内容。对于只有内容的渠道，默认会拼接 title 和 desc 参数。
当设定了 content 参数时，则会直接使用该参数的取值。

```javascript
DPApp.share({
  title:"分享标题",
  desc:"分享描述",
  content:"分享内容",
  image:"http://www.dpfile.com/toevent/img/16d05c85a71b135edc39d197273746d6.png",
  url:"http://m.dianping.com",
  success: function(){
    alert('分享成功');
  }
});
```

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
  }
});
```
可选广播类型包括
loginSuccess: 登录成功
switchCity: 切换城市
background: 应用切换到后台
foreground: 应用切换回前台

## 取消订阅
```javascript
DPApp.unsubscribe({
  action: 'loginSuccess',
  success: function(e){
  }
});
```

## 设置标题
```javascript
DPApp.setTitle({
  title: "标题"
});
```

## 设置导航栏按钮

> 左侧第一个

```javascript
DPApp.setLLButton({
  text: "文字",
  icon: "http://..."
});
```


> 左侧第二个

```javascript
DPApp.setLRButton({
  text: "文字",
  icon: "http://..."
});
```

> 右侧第一个

```javascript
DPApp.setRLButton({
  text: "文字",
  icon: "http://..."
});
```


> 右侧第二个

```javascript
DPApp.setRRButton({
  text: "文字",
  icon: "http://..."
});
```


