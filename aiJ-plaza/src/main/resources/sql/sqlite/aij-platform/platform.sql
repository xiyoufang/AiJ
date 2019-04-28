### 通过code获取配置
#sql("get_setting_by_domain_code")
SELECT * FROM setting s WHERE s.domain = #p(0) and s.code = #p(1)
#end
