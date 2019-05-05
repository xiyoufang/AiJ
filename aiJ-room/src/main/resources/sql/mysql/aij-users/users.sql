### 读取机器人用户
#sql("get_android_users")
  SELECT * FROM user_profile p WHERE p.android = 1
#end