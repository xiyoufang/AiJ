#sql("get_player_page")
SELECT * FROM user_profile s WHERE true
    #if(StrKit.notBlank(nick_name))
        AND s.nick_name LIKE concat('%', #p(nick_name), '%')
    #end
    #if(status != null)
        AND s.status = #p(status)
    #end
#end
