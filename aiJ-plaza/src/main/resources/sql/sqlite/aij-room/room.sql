### 保存游戏记录信息
#sql("get_room_record_pages")
SELECT r.id,
       r.owner_id,
       r.table_no,
       r.started_time,
       r.ended_time,
       r.service_id,
       r.service_name,
       u.user_id,
       u.chair,
       u.nick_name,
       u.score,
       d.summary,
       d.detail,
       d.rule
FROM room_record r
       LEFT JOIN room_record_user u ON (r.id = u.record_id)
       LEFT JOIN room_record_detail d ON (r.record_detail_id = d.id)
WHERE u.user_id = #p(0)
ORDER BY r.id desc
#end