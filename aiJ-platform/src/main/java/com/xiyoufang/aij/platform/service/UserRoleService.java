package com.xiyoufang.aij.platform.service;

import com.jfinal.aop.Duang;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;

import java.util.Date;

/**
 * Created by 席有芳 on 2020-03-28.
 *
 * @author 席有芳
 */
public class UserRoleService {


    /**
     * 单例，实例
     */
    public final static UserRoleService me = Duang.duang(UserRoleService.class);

    /**
     * 更新
     *
     * @param record record
     * @return boolean
     */
    public boolean update(Record record) {
        record.set("modified_time", new Date());
        return AiJPlatformDb.uc().updateByUnique("user_role", "user_id", record);
    }

    /**
     * 保存
     *
     * @param record record
     * @return boolean
     */
    public boolean save(Record record) {
        record.set("modified_time", new Date());
        record.set("created_time", new Date());
        return AiJPlatformDb.uc().save("user_role", "id", record);
    }
}
