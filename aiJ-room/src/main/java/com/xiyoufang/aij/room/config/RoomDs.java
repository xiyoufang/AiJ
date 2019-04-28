package com.xiyoufang.aij.room.config;

import com.xiyoufang.aij.core.AiJDs;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.CoreDs;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class RoomDs extends CoreDs {

    public RoomDs() {

    }

    public RoomDs(CoreDs coreDs) {
        super(coreDs);
    }

    /**
     * 添加游戏数据源
     *
     * @param ds ds
     */
    public void addRoomDs(AiJDs ds) {
        add(AppConfig.use().getStr(RoomConfig.DS_ROOM), ds);
    }

    /**
     * 获取游戏数据源
     *
     * @return ds
     */
    public AiJDs getRoomDs() {
        return get(AppConfig.use().getStr(RoomConfig.DS_ROOM));
    }

}
