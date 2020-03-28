#sql("get_role_page")
SELECT * FROM role s WHERE true
    #if(StrKit.notBlank(name))
        AND s.name LIKE concat('%', #p(name), '%')
    #end
#end
