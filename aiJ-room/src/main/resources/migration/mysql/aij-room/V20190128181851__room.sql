-- 游戏详情
CREATE TABLE room_record_detail
(
  id           bigint PRIMARY KEY,
  rule         text,       -- 游戏规则
  summary      text,       -- 概要信息
  detail       mediumtext, -- 游戏记录
  created_time datetime    -- 创建时间
);

-- 游戏记录
CREATE TABLE room_record
(
  id               bigint PRIMARY KEY,
  service_id       integer,     -- 服务ID
  service_name     varchar(32), -- 服务名称
  owner_id         varchar(64), -- 创建者ID
  diamond          integer,     -- 钻石数量
  cost             integer,     -- 消耗钻石
  circle_id        integer,     -- 亲友圈ID
  table_no         integer,     -- 房间号
  end_reason       varchar(32), -- 结束原因
  initialized_time datetime,    -- 初始化时间
  started_time     datetime,    -- 开始时间
  ended_time       datetime,    -- 结束时间
  created_time     datetime,    -- 记录创建时间
  record_detail_id bigint      -- 详情ID
);

-- 游戏对应的玩家
CREATE TABLE room_record_user
(
  id           bigint PRIMARY KEY,
  record_id    bigint,       -- 游戏记录ID
  user_id      varchar(64),  -- 用户ID
  nick_name    varchar(128), -- 玩家名称
  chair        int,          -- 椅子编号
  score        int,          -- 总分
  created_time text          -- 创建时间
);

-- 游戏分数
CREATE TABLE room_record_score
(
  id           bigint PRIMARY KEY,
  record_id    bigint,      -- 游戏记录ID
  user_id      varchar(64), -- 用户ID
  room_number  integer,     -- 第几局
  score        integer,     -- 单局
  created_time datetime     -- 创建时间
);

