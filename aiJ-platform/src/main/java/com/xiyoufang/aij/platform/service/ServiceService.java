package com.xiyoufang.aij.platform.service;

import com.jfinal.aop.Duang;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.dto.ServiceDTO;

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
     * @param serviceDTO serviceDTO
     * @return recode
     */
    public Record save(ServiceDTO serviceDTO) {
        Record record = new Record()
                .set("type", serviceDTO.getType().name())
                .set("code", serviceDTO.getCode())
                .set("name", serviceDTO.getName())
                .set("description", serviceDTO.getDescription())
                .set("created_time", new Date())
                .set("modified_time", new Date());
        AiJPlatformDb.platform().save("service", "id", record);
        return record;
    }

    /**
     * 更新
     *
     * @param serviceDTO serviceDTO
     * @return recode
     */
    public Record update(ServiceDTO serviceDTO) {
        Record record = AiJPlatformDb.platform().findById("service", serviceDTO.getId());
        record.set("type", serviceDTO.getType().name())
                .set("code", serviceDTO.getCode())
                .set("name", serviceDTO.getName())
                .set("description", serviceDTO.getDescription())
                .set("protected", 'N')
                .set("modified_time", new Date());
        AiJPlatformDb.platform().update("service", "id", record);
        return record;
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
