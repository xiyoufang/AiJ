#sql("get_service_page")
SELECT * FROM service s WHERE true
    #if(StrKit.notBlank(name))
    AND s.name LIKE concat('%', #p(name), '%')
    #end
ORDER BY sort
#end
