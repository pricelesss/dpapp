# CHANGELOG

1.0.0

- 详见文档 http://efte.github.io/dpapp/

1.0.1

- 新增initShare用于初始化右上分享按钮
- 修复web下ready的问题
- 修复networkType获取错误的问题
- 修复老版本share feed通道值与新版本不一致的问题

1.1.0

- 修复web中ready的问题
- 改进区分web/6.9.x的方式，不依赖product=dpapp
- 新增DPApp.onerror，可用于统一处理未handle的fail
- 新增全局js错误监控
- 新增调用成功率打点
- 新增api jumpToScheme
- 新增api store / retrieve
- 新增DPApp.config({bizname:"<bizname>"})