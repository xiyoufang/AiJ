package com.xiyoufang.aij.platform.service;

import com.jfinal.aop.Duang;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;

import java.util.Date;

/**
 * Created by 席有芳 on 2020-04-01.
 * 角色Service
 *
 * @author 席有芳
 */
public class RoleService {

    /**
     *
     */
    public final static RoleService me = Duang.duang(RoleService.class);

    /**
     * 更新角色资料
     *
     * @param record record
     * @return boolean result
     */
    public boolean update(Record record) {
        record.set("modified_time", new Date());
        return AiJPlatformDb.uc().updateByUnique("role", "id", record);
    }

    /**
     * 创建新的角色
     *
     * @param record record
     * @return boolean result
     */
    public boolean save(Record record) {
        Date now = new Date();
        record.set("created_time", now);
        record.set("modified_time", now);
        record.set("protected", "N");
        record.set("status", 1);
        return AiJPlatformDb.uc().save("role", "id", record);
    }
}
