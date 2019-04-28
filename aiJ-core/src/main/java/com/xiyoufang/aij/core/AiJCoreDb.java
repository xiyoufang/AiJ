package com.xiyoufang.aij.core;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.DbPro;

/**
 * Created by 席有芳 on 2018-12-26.
 *
 * @author 席有芳
 */
public class AiJCoreDb {

    /**
     * 用户中心
     *
     * @return DbPro
     */
    public static AiJDbPro uc() {
        return (AiJDbPro) Db.use(AppConfig.use().getStr(CoreConfig.DS_USER_CENTER));
    }

    /**
     * 平台
     *
     * @return DbPro
     */
    public static AiJDbPro platform() {
        return (AiJDbPro) Db.use(AppConfig.use().getStr(CoreConfig.DS_PLATFORM));
    }

}
