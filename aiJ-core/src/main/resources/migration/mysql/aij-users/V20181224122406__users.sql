-- 用户基本信息表
CREATE TABLE user_profile
(
    id             integer PRIMARY KEY AUTO_INCREMENT, -- 显示用的ID（发生修改不影响业务）
    user_id        varchar(64),                        -- 用户ID（数据关联用的ID）
    user_name      varchar(128),                       -- 用户名称
    nick_name      varchar(128),                       -- 用户昵称（一般显示都用昵称）
    gender         integer,                            -- 性别(1男,2女,3未知) //普通用户性别，1为男性，2为女性
    email          varchar(128),                       -- 邮箱
    email_status   integer,                            -- 邮箱状态(0待验证,1正常)
    mobile         varchar(64),                        -- 手机
    mobile_status  integer,                            -- 手机状态(0待验证,1正常)
    avatar         varchar(512),                       -- 头像
    cert_name      varchar(128),                       -- 实名
    cert_card      varchar(64),                        -- 身份证
    cert_type      varchar(64),                        -- 实名制类型
    cert_status    varchar(8),                         -- 实名制(-未验证,0验证中,1验证通过)
    android        integer,                            -- 机器人标识(1是，0否)
    geo_hash       varchar(16),                        -- GeoHash（8位）
    longitude      double,                             -- 经度
    latitude       double,                             -- 纬度
    address        varchar(512),                       -- 地址
    ip             varchar(64),                        -- Ip地址
    referrer_id    varchar(64),                        -- 介绍人ID
    device_id      varchar(64),                        -- 设备ID
    status         integer,                            -- 状态(-1禁用,0未激活,1正常)
    introduction   text,                               -- 自我介绍
    remark         text,                               -- 备注
    created_source varchar(64),                        -- 注册来源
    created_time   datetime,                           -- 注册时间
    modified_time  datetime,                           -- 更新时间
    login_time     datetime,                           -- 登录时间
    activated_time datetime,                           -- 激活时间
    UNIQUE (user_id)
);

-- 实名制，拉链表（9999-01-01 00:00:00）
CREATE TABLE user_cert
(
    id           integer PRIMARY KEY AUTO_INCREMENT,
    user_id      varchar(64),  -- 用户ID
    cert_name    varchar(128), -- 实名
    cert_card    varchar(64),  -- 身份证
    cert_mobile  varchar(64),  -- 手机号
    cert_type    varchar(8),   -- 实名制类型
    cert_status  varchar(8),   -- 状态（0提交，1通过，2不通过）
    started_time datetime,     -- 开始时间
    ended_time   datetime,     -- 结束时间
    created_time datetime      -- 创建时间
);

-- 用户活动记录
CREATE TABLE user_activity
(
    id           integer PRIMARY KEY AUTO_INCREMENT,
    user_id      varchar(64), -- 用户ID
    code         varchar(64), -- activity Code
    data         text,        -- activity数据
    ip           varchar(64), -- IP地址
    device_id    varchar(64), -- 设备ID
    created_time datetime     -- 添加时间
);

-- 邮箱登录
CREATE TABLE user_local_auth
(
    user_id       varchar(64) PRIMARY KEY, -- 用户ID
    mobile        varchar(64),             -- 登录用手机
    email         varchar(128),            -- 登录用邮箱
    password      varchar(64),             -- 密码
    salt          varchar(64),             -- 盐
    enable        integer,                 -- 是否启用
    modified_time datetime,                -- 更新时间
    created_time  datetime                 -- 启用时间
);

-- 微信登录
CREATE TABLE user_wx_auth
(
    user_id      varchar(64) PRIMARY KEY, -- 用户ID
    open_id      varchar(64),             -- 微信openid
    union_id     varchar(64),             -- 微信unionId
    enable       integer,                 -- 是否启用
    created_time datetime                 -- 启用时间
);

-- 用户资产表
CREATE TABLE user_asset
(
    user_id    varchar(64), -- 用户ID
    asset_code varchar(64), -- 资产标识
    quantity   integer,     -- 资产数量
    primary key (user_id, asset_code)
);

-- 用户交易表
CREATE TABLE user_asset_trans
(
    id           integer PRIMARY KEY AUTO_INCREMENT,
    seller_id    varchar(64), -- 卖方ID
    buyer_id     varchar(64), -- 买方ID
    asset_code   varchar(64), -- 资产标识
    quantity     integer,     -- 资产数量
    created_time datetime     -- 变更时间
);

-- 用户资产变更记录
CREATE TABLE user_asset_change
(
    id           integer PRIMARY KEY AUTO_INCREMENT,
    user_id      varchar(64), -- 用户ID
    asset_code   varchar(64), -- 资产标识
    old_quantity integer,     -- 老数量
    new_quantity integer,     -- 新数量
    description  text,        -- 变更描述
    created_time datetime     -- 变更时间
);

-- 圈子表
CREATE TABLE circle
(
    id           integer PRIMARY KEY AUTO_INCREMENT,
    user_id      varchar(64),  -- 圈子Owner的ID
    circle_name  varchar(128), -- 圈子名称
    description  text,         -- 圈子描述
    created_time datetime      -- 创建时间
);

-- 圈子成员表
CREATE TABLE circle_member
(
    circle_id    integer,     -- 圈子ID
    user_id      varchar(64), -- 用户ID
    status       varchar(64), -- 成员状态
    created_time datetime,    -- 创建时间
    primary key (circle_id, user_id)
);

-- 圈子成员变更表
CREATE TABLE circle_member_change
(
    id           integer PRIMARY KEY AUTO_INCREMENT,
    circle_id    integer,     -- 圈子ID
    user_id      varchar(64), -- 用户ID
    description  text,        -- 变更描述
    created_time datetime     -- 创建时间
);

-- 代理人
CREATE TABLE distributor
(
    id             integer PRIMARY KEY AUTO_INCREMENT,
    user_id        varchar(64), -- 用户ID
    parent_user_id varchar(64), -- 上级用户ID
    level          integer,     -- 级别
    status         integer,     -- 状态(1 ACTIVE\ -1 INACTIVE)
    remark         text,        -- 备注
    modified_time  datetime,    -- 更新时间
    created_time   datetime,    -- 创建时间
    UNIQUE (user_id)
);

-- 代理人活动记录
CREATE TABLE distributor_activity
(
    id                  integer PRIMARY KEY AUTO_INCREMENT,
    distributor_user_id varchar(64), -- 代理ID
    code                varchar(64), -- activity Code
    data                text,        -- activity数据
    ip                  varchar(64), -- IP地址
    device_id           varchar(64), -- 设备ID
    created_time        datetime     -- 添加时间
);

-- 角色表
CREATE TABLE role
(
    id            integer PRIMARY KEY AUTO_INCREMENT,
    name          varchar(64), -- 角色名称 (administrator / distributor / analyser / player ) 默认都是player
    permissions   text,        -- 角色权限（array）
    menus         text,        -- 菜单（array）
    description   text,        -- 角色描述
    protected     char(1),     -- 系统保护 (Y\N)
    status        integer,     -- 状态(-1禁用,1正常)
    modified_time datetime,    -- 更新时间
    created_time  datetime,    -- 创建时间
    UNIQUE (name)
);

-- 用户角色表（分配了角色的用户具有后台管理系统的登录权限）
CREATE TABLE user_role
(
    id            integer PRIMARY KEY AUTO_INCREMENT,
    user_id       varchar(64), -- 用户ID
    roles         text,        -- 角色数组（array）
    status        integer,     -- 状态(-1禁用,1正常)
    modified_time datetime,    -- 更新时间
    created_time  datetime,    -- 创建时间
    UNIQUE (user_id)
);
