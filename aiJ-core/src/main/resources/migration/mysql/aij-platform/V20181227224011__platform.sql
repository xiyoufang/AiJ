-- 服务信息表
CREATE TABLE service
(
    id            integer PRIMARY KEY AUTO_INCREMENT,
    type          varchar(32),   -- 服务类型
    code          integer,       -- 服务编码 1001
    name          varchar(128),  -- 显示名称 麻将
    description   text,          -- 服务描述
    protected     char(1),       -- 系统保护 (Y\N)
    icon          varchar(1023), -- 服务图标URL（图标将用于客户端显示）
    deployment    varchar(1023), -- 下载/热更新相关地址
    sort          integer,       -- 排列顺序
    created_time  datetime,      -- 创建时间
    modified_time datetime       -- 修改时间
);

-- 配置表
CREATE TABLE setting
(
    domain        varchar(32), -- 域（plaza大厅/platform平台）
    code          varchar(64), -- 设置Code
    value         text,        -- 设置的Value
    description   text,        -- 设置描述
    serialized    integer,     -- 是否被序列化
    created_time  datetime,    -- 创建时间
    modified_time datetime,    -- 修改时间
    primary key (domain, code)
);

-- 通知表
CREATE TABLE notice
(
    id            integer PRIMARY KEY AUTO_INCREMENT,
    domain        varchar(32),  -- 域（plaza大厅/platform平台）
    name          varchar(128), -- 公告名称
    context       text,         -- 公告内容
    description   text,         -- 描述
    type          varchar(32),  -- 公告类型（text/html/image）
    started_time  datetime,     -- 起始日期
    ended_time    datetime,     -- 截止日期
    expired       integer,      -- 失效状态（0有效/1失效）
    forced        integer,      -- 强制显示（0不强制/1强制显示）
    created_time  datetime,     -- 创建时间
    modified_time datetime      -- 修改时间
);

-- 字典表
CREATE TABLE dictionary
(
    type         varchar(32),  -- 字典类型
    code         varchar(64),  -- 字典Code
    name         varchar(128), -- 字典名称
    created_time datetime,     -- 创建时间
    primary key (type, code)
);
