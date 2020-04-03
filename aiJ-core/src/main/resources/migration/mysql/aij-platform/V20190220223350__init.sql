-- 初始化服务
INSERT INTO service (id, type, code, name, description, protected, created_time, modified_time) VALUES (1, 'PLAZA', 100002, '游戏大厅', '游戏大厅服务', 'Y', '2019-04-28 15:33:23', '2019-07-25 23:47:01');
INSERT INTO service (id, type, code, name, description, protected, created_time, modified_time) VALUES (2, 'PLATFORM', 100001, '运营平台', '运营管理平台', 'Y', '2019-04-28 17:05:57', '2020-03-23 22:28:52');
INSERT INTO service (id, type, code, name, description, protected, created_time, modified_time) VALUES (3, 'ROOM', 200001, '南丰麻将', '南丰麻将服务器', 'N', '2019-04-28 17:41:40', '2019-07-28 21:51:58');

-- 初始化配置
INSERT INTO setting (domain, code, value, description, serialized, created_time, modified_time) VALUES ('platform', 'plaza_broadcast', '["游戏仅供娱乐,严禁赌博!","游戏开发交流群:112958956"]', '大厅提示', 1, '2019-02-20 08:00:00', '2019-02-20 08:00:00');

-- 初始化字典
INSERT INTO dictionary (type, code, name, created_time) VALUES ('user_asset','diamond','钻石','2019-02-20 22:39:37');
INSERT INTO dictionary (type, code, name, created_time) VALUES ('user_asset','gold_coin','金币','2019-02-20 22:39:37');
INSERT INTO dictionary (type, code, name, created_time) VALUES ('user_asset','room_card','房卡','2019-02-20 22:39:37');
