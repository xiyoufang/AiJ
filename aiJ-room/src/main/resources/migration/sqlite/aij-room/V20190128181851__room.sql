-- 游戏详情
CREATE TABLE room_record_detail
(
  id           integer PRIMARY KEY,
  rule         text, -- 游戏规则
  summary      text,
  detail       text, -- 游戏记录
  created_time text  -- 创建时间
);

-- 游戏记录
CREATE TABLE room_record
(
  id               integer PRIMARY KEY,
  service_id       integer, -- 服务ID
  service_name     text,    -- 服务名称
  owner_id         text,    -- 创建者ID
  diamond          integer, -- 钻石数量
  cost             integer, -- 消耗钻石
  circle_id        integer, -- 亲友圈ID
  table_no         integer, -- 房间号
  end_reason       text,    --结束原因
  initialized_time text,    -- 初始化时间
  started_time     text,    -- 开始时间
  ended_time       text,    -- 结束时间
  created_time     text,    -- 记录创建时间
  record_detail_id integer  -- 详情ID
);

-- 游戏对应的玩家
CREATE TABLE room_record_user
(
  id           integer PRIMARY KEY,
  record_id    integer, -- 游戏记录ID
  user_id      text,    -- 用户ID
  nick_name    text,    -- 玩家名称
  chair        integer, -- 椅子编号
  score        integer, -- 总分
  created_time text     -- 创建时间
);

--游戏分数
CREATE TABLE room_record_score
(
  id           integer PRIMARY KEY,
  record_id    integer, -- 游戏记录ID
  user_id      text,    -- 用户ID
  room_number  integer, -- 第几局
  score        integer, -- 单局
  created_time text     -- 创建时间
);

