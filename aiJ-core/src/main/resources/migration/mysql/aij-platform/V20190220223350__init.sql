-- 初始化配置
INSERT INTO setting (domain, code, value, description, serialized, created_time, modified_time) VALUES ('platform', 'plaza_broadcast', '["游戏仅供娱乐,严禁赌博!","游戏开发交流群:112958956"]', '大厅提示', 1, '2019-02-20 08:00:00', '2019-02-20 08:00:00');

-- 初始化字典
INSERT INTO dictionary (type, code, name, created_time) VALUES ('user_asset','diamond','钻石','2019-02-20 22:39:37');
INSERT INTO dictionary (type, code, name, created_time) VALUES ('user_asset','gold_coin','金币','2019-02-20 22:39:37');
INSERT INTO dictionary (type, code, name, created_time) VALUES ('user_asset','room_card','房卡','2019-02-20 22:39:37');