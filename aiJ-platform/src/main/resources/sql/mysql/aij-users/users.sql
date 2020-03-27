#sql("get_user_page")
SELECT * FROM user_profile s WHERE true
    #if(StrKit.notBlank(user_name))
        AND s.user_name LIKE concat('%', #p(user_name), '%')
    #end
    #if(status != null)
        AND s.status = #p(status)
    #end
#end
