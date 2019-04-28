### 保存游戏详情
#sql("save_room_record_detail")
INSERT INTO room_record_detail (id, rule, summary, detail, created_time)
VALUES (
         #p(0),#p(1),#p(2),#p(3),#p(4)
       );
#end

### 保存游戏记录信息
#sql("save_room_record")
INSERT INTO room_record (id, service_id, service_name, owner_id, diamond, cost, circle_id, table_no, end_reason,
                         initialized_time, started_time, ended_time, created_time, record_detail_id)
VALUES (
         #p(0),#p(1),#p(2),#p(3),#p(4),#p(5),#p(6),#p(7),#p(8),#p(9),#p(10),#p(11),#p(12),#p(13)
       );
#end

### 保存游戏玩家
#sql("save_room_record_user")
INSERT INTO room_record_user (id, record_id, user_id, nick_name, chair, score, created_time)
VALUES (
         #p(0),#p(1),#p(2),#p(3),#p(4),#p(5),#p(6)
       );
#end

### 保存分数信息
#sql("save_room_record_score")
INSERT INTO room_record_score (id, record_id, user_id, room_number, score, created_time)
VALUES (
         #p(0),#p(1),#p(2),#p(3),#p(4),#p(5)
       );
#end