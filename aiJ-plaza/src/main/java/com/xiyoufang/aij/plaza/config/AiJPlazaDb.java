package com.xiyoufang.aij.plaza.config;

import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.DbPro;
import com.xiyoufang.aij.core.AiJCoreDb;
import com.xiyoufang.aij.core.AppConfig;

/**
 * Created by 席有芳 on 2019-01-28.
 *
 * @author 席有芳
 */
public class AiJPlazaDb extends AiJCoreDb {

    /**
     * 房间数据库
     *
     * @return DbPro
     */
    public static DbPro room() {
        return Db.use(AppConfig.use().getStr(PlazaConfig.DS_ROOM));
    }

}
