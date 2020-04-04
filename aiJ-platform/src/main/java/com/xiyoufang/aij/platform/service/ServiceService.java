package com.xiyoufang.aij.platform.service;

import com.jfinal.aop.Duang;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;

import java.util.Date;

/**
 * Created by 席有芳 on 2020-03-26.
 *
 * @author 席有芳
 */
public class ServiceService {

    /**
     * 单例，实例
     */
    public final static ServiceService me = Duang.duang(ServiceService.class);

    /**
     * 保存
     *
     * @param record record
     * @return recode
     */
    public boolean save(Record record) {
        record.set("protected", 'N').set("created_time", new Date()).set("modified_time", new Date());
        return AiJPlatformDb.platform().save("service", "id", record);
    }

    /**
     * 更新
     *
     * @param record record
     * @return boolean result
     */
    public boolean update(Record record) {
        record.set("modified_time", new Date());
        return AiJPlatformDb.platform().updateByUnique("service", "id", record);
    }


    /**
     * 通过Code查询记录
     *
     * @param code code
     * @return Record
     */
    public Record findByCode(String code) {
        return AiJPlatformDb.platform().findByUnique("service", "code", code);
    }

    /**
     * 通过ID查询
     *
     * @param id id
     * @return Record
     */
    public Record findById(Integer id) {
        return AiJPlatformDb.platform().findById("service", id);
    }
}
