--用户基本信息表
CREATE TABLE user_profile
(
  id             integer PRIMARY KEY AUTOINCREMENT,
  user_id        text, --用户ID
  user_name      text, --用户名称
  nick_name      text, --用户昵称
  gender         int,  --性别(0男,1女,3未知)
  email          text, --邮箱
  email_status   int,  --邮箱状态(0待验证,1正常)
  mobile         text, --手机
  mobile_status  int,  --手机状态(0待验证,1正常)
  avatar         text, --头像
  cert_name      text, --实名
  cert_card      text, --身份证
  cert_type      text, --实名制类型
  cert_status    text, --实名制(-未验证,0验证中,1验证通过)
  geo_hash       text, --GeoHash（8位）
  longitude      real, --经度
  latitude       real, --纬度
  address        text, --地址
  ip             text, --Ip地址
  referrer_id    text, --介绍人ID
  device_id      text, --设备ID
  status         int,  --状态(-1禁用,0未激活,1正常)
  remark         text, --备注
  created_source text, --注册来源
  created_time   text, --注册时间
  login_time     text, --登录时间
  activated_time text, --激活时间
  UNIQUE (user_id)
);

--实名制，拉链表（9999-01-01 00:00:00）
CREATE TABLE user_cert
(
  id           integer PRIMARY KEY AUTOINCREMENT,
  user_id      text, --用户ID
  cert_name    text, --实名
  cert_card    text, --身份证
  cert_mobile  text, --手机号
  cert_type    text, --实名制类型
  cert_status  text, --状态（0提交，1通过，2不通过）
  started_time text, --开始时间
  ended_time   text, --结束时间
  created_time text  --创建时间
);

CREATE TABLE user_activity
(
  id           integer PRIMARY KEY AUTOINCREMENT,
  user_id      text, --用户ID
  code         text, --activity Code
  data         text, --activity数据
  ip           text, --IP地址
  device_id    text, --设备ID
  created_time text  --添加时间
);

--邮箱登录
CREATE TABLE user_local_auth
(
  user_id      text PRIMARY KEY, --用户ID
  mobile       text,             --登录用手机
  email        text,             --登录用邮箱
  password     text,             --密码
  salt         text,             --盐
  enable       int,              --是否启用
  created_time text              --启用时间
);

--微信登录
CREATE TABLE user_wx_auth
(
  user_id      text PRIMARY KEY, --用户ID
  wx_openid    text,             --微信openid
  enable       int,              --是否启用
  created_time text              --启用时间
);

--用户权限表
CREATE TABLE user_permission
(
  user_id       text PRIMARY KEY, --用户ID
  permission    text,             --用户权限数组方式存储
  modified_time text              --修改时间
);

--用户资产表
CREATE TABLE user_asset
(
  user_id    text, --用户ID
  asset_code text, --资产标识
  quantity   int,  --资产数量
  primary key (user_id, asset_code)
);

--用户交易表
CREATE TABLE user_asset_trans
(
  id           integer PRIMARY KEY AUTOINCREMENT,
  seller_id    text, --卖方ID
  buyer_id     text, --买方ID
  asset_code   text, --资产标识
  quantity     int,  --资产数量
  created_time text  --变更时间
);

--用户资产变更记录
CREATE TABLE user_asset_change
(
  id           integer PRIMARY KEY AUTOINCREMENT,
  user_id      text, --用户ID
  asset_code   text, --资产标识
  old_quantity int,  --老数量
  new_quantity int,  --新数量
  description  text, --变更描述
  created_time text  --变更时间
);

--圈子表
CREATE TABLE circle
(
  id           integer PRIMARY KEY AUTOINCREMENT,
  user_id      text, --圈子Owner的ID
  circle_name  text, --圈子名称
  description  text, --圈子描述
  created_time text  --创建时间
);

--圈子成员表
CREATE TABLE circle_member
(
  circle_id    int,  --圈子ID
  user_id      text, --用户ID
  status       text, --成员状态
  created_time text, --创建时间
  primary key (circle_id, user_id)
);

--圈子成员变更表
CREATE TABLE circle_member_change
(
  id           integer PRIMARY KEY AUTOINCREMENT,
  circle_id    int,  --圈子ID
  user_id      text, --用户ID
  description  text, --变更描述
  created_time text  --创建时间
);

--代理人
CREATE TABLE distributor
(
  id           integer PRIMARY KEY AUTOINCREMENT,
  user_id      text, --用户ID
  parent_id    int,  --上级ID
  level        int,  --级别
  status       text, --状态
  created_time text, --创建时间
  UNIQUE (user_id)
);

--代理人活动记录
CREATE TABLE distributor_activity
(
  id             integer PRIMARY KEY AUTOINCREMENT,
  distributor_id text, --代理ID
  code           text, --activity Code
  data           text, --activity数据
  ip             text, --IP地址
  device_id      text, --设备ID
  created_time   text  --添加时间
);