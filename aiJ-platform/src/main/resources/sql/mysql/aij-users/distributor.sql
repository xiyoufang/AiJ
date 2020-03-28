#sql("get_distributor_page")
SELECT u.*,
       d.parent_id,
       v.nick_name as parent_name,
       d.level,
       d.remark,
       d.status as distributor_status
FROM distributor d
         LEFT JOIN user_profile u ON (d.user_id = u.user_id)
         LEFT JOIN user_profile v ON (d.parent_id = v.user_id)
WHERE true
#if(StrKit.notBlank(nick_name))
  AND u.nick_name LIKE concat('%', #p(nick_name), '%')
#end
#end
