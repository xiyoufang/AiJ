#sql("get_distributor_page")
SELECT u.*,
       v.id as parent_id,
       v.nick_name as parent_nick_name,
       d.parent_user_id as parent_user_id,
       d.level,
       d.remark,
       d.status as distributor_status
FROM distributor d
         LEFT JOIN user_profile u ON (d.user_id = u.user_id)
         LEFT JOIN user_profile v ON (d.parent_user_id = v.user_id)
WHERE true
#if(StrKit.notBlank(nick_name))
  AND u.nick_name LIKE concat('%', #p(nick_name), '%')
#end
#if(status != null)
  AND d.status = #p(status)
#end
#if(parent_user_id != null)
  AND d.parent_user_id = #p(parent_user_id)
#end
#end
