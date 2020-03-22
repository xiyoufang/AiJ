### 获取用户资产
#sql("get_user_asset")
SELECT u.quantity FROM user_asset u WHERE u.user_id = #p(0) and u.asset_code = #p(1)
#end

### 通过邮箱登录
#sql("user_auth_by_email")
SELECT u.*, a.password, a.salt, d.id as distributor_id
FROM user_local_auth a
       left join user_profile u
                 on (u.user_id = a.user_id)
       left join distributor d on (u.user_id = d.user_id)
WHERE (a.email = #p(0) and a.enable = 1 and u.status = 1)
#end

### 通过手机号码
#sql("user_auth_by_mobile")
SELECT u.*, a.password, a.salt, d.id as distributor_id
FROM user_local_auth a
       left join user_profile u
                 on (u.user_id = a.user_id)
       left join distributor d on (u.user_id = d.user_id)
WHERE (a.mobile = #p(0) and a.enable = 1 and u.status = 1)
#end

### 通过用户ID查询角色权限
#sql("find_roles_by_user")
SELECT r.name, r.permissions
FROM user_role ur
         left join role r on (ur.role_name = r.name)
WHERE ur.user_id = #p(0)
#end
