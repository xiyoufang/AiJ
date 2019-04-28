package com.xiyoufang.aij.plaza.config;

import com.xiyoufang.aij.core.Config;
import com.xiyoufang.aij.core.CoreConfig;

/**
 * Created by 席有芳 on 2019-01-30.
 *
 * @author 席有芳
 */
public class PlazaConfig extends CoreConfig {

    public static final String DS_ROOM = "$ds_room";

    public PlazaConfig(Config config) {
        super(config);
    }

    /**
     * 设置房间数据源
     *
     * @param name name
     */
    public void setDsRoom(String name) {
        setStr(DS_ROOM, name);
    }

}
