# AiJ 游戏服务器

#### 演示地址

* 运营管理平台：http://aij.xiyoufang.com/
* 在线游戏：http://game.xiyoufang.com/ (有机器人陪玩哦)

#### 介绍
AiJ是一套完整的房间类游戏解决方案，支持无限水平扩展来满足更大的人数承载，并且提供了良好的调试接口。

主要模块包括：

* 注册中心
* 大厅服务 
* 游戏服务
* 亲友圈服务
* 运营管理系统
* CocosCreator游戏客户端。

网络协议使用Websocket，以更好的支持多平台需求，计划同时支持Mysql、Oracle、SqlServer、Postgresql、Sqlite等多种数据库。

具有完整的机器人体系，机器人自动游戏，高智商游戏AI。

#### 帮助文档

- [快速开始](./doc/aij_quick_start_dev.md)
- 子游戏开发
- 客户端调试
- 未完待续...


#### 技术架构

* Socket框架tio
* mvc与orm框架jfinal
* 注册中心zookeeper
* 网络协议Websocket
* 数据库版本管理flyway
* 客户端游戏引擎CocosCreator
* 客户端编辑器FairyGUI
* NodeJs
* 开发语言:java、typescript、javascript、sql

### 业务架构
* 大厅
    * 房卡充值
    * 游戏回放
    * 游戏战绩
    * 实名制
    * ...
* 子游戏
    * 麻将
    * 斗地主
    * 象棋
    * ...
* 亲友圈
    * ...
* 运营管理
    * 玩家管理
    * 服务器管理
    * 代理管理
    * 报表统计
    * ...

#### 快速了解

* UI编辑器

![输入图片说明](https://gitee.com/uploads/images/2019/0428/175537_3e7b183a_369917.png "2.png")

* 子游戏

<table>
    <tr>
        <td><img src="https://gitee.com/uploads/images/2019/0428/213459_1ec2c286_369917.png"/></td>
        <td><img src="https://gitee.com/uploads/images/2019/0428/213413_7b220071_369917.png"/></td>
    </tr>
    <tr>
        <td><img src="https://gitee.com/uploads/images/2019/0428/213439_d873ad71_369917.png"/></td>
        <td><img src="https://gitee.com/uploads/images/2019/0428/214352_4e7b7e03_369917.png"/></td>
    </tr>
</table>

* 运营管理

<table>
    <tr>
        <td colspan="2">玩家、游戏服务、角色权限、机器人</td>
    </tr>
    <tr>
        <td><img src="./doc/screenshot/screenshot_0.png"/></td>
        <td><img src="./doc/screenshot/screenshot_1.png"/></td>
    </tr>
    <tr>
        <td><img src="./doc/screenshot/screenshot_2.png"/></td>
        <td><img src="./doc/screenshot/screenshot_3.png"/></td>
    </tr>
    <tr>
        <td colspan="2">机器人自动游戏，后台管理系统观看游戏录像</td>
    </tr>
    <tr>
        <td><img src="./doc/screenshot/screenshot_4.png"/></td>
        <td><img src="./doc/screenshot/screenshot_5.png"/></td>
    </tr>
</table>



#### 参与贡献

1. Fork 本仓库
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request


#### 其他

1. 个人博客 [www.xiyoufang.com](https://www.xiyoufang.com) 获取更多软件开发信息
2. gitee项目首页 [https://gitee.com/xiyoufang/aij](https://gitee.com/xiyoufang/aij)
3. 欢迎关注我的个人微信订阅号

![输入图片说明](https://images.gitee.com/uploads/images/2018/0712/165633_95e6b777_369917.jpeg "qrcode_for_gh_3870df3b5d1f_344.jpg")

### 您也可以加入游戏开发交流QQ群：112958956 ，一起讨论游戏开发技术。

![输入图片说明](https://images.gitee.com/uploads/images/2018/0708/183503_d1f599f2_369917.png "temp_qrcode_share_112958956.png")
