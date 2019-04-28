-- 服务信息表
CREATE TABLE service
(
  id            integer PRIMARY KEY AUTOINCREMENT,
  type          text, -- 服务类型
  code          int,  -- 服务编码 1001
  name          text, -- 显示名称 麻将
  description   text, -- 服务描述
  token         text, -- 服务Token,用于与其他服务之间交互鉴权用
  created_time  text, -- 创建时间
  modified_time text  -- 修改时间
);

-- 配置表
CREATE TABLE setting
(
  domain        text,     -- 范围
  code          text,     -- 设置Code
  value         text,     -- 设置的Value
  description   text,     -- 设置描述
  serialized    int,      -- 是否被序列化
  created_time  datetime, -- 创建时间
  modified_time datetime, -- 修改时间
  primary key (domain, code)
);

-- 通知表
CREATE TABLE notice
(
  id            integer PRIMARY KEY AUTOINCREMENT,
  domain        text, -- 公告来源（plaza大厅/platform平台）
  name          text, -- 公告名称
  context       text, -- 公告内容
  description   text, -- 描述
  type          text, -- 公告类型（text/html/image）
  started_time  text, -- 起始日期
  ended_time    text, -- 截止日期
  expired       int,  -- 失效状态（0有效/1失效）
  forced        int,  -- 强制显示（0不强制/1强制显示）
  created_time  text, -- 创建时间
  modified_time text  -- 修改时间
);

-- 字典表
CREATE TABLE dictionary
(
  type         text, -- 字典类型
  code         text, -- 字典Code
  name         text, -- 字典名称
  created_time text, -- 创建时间
  primary key (type, code)
);