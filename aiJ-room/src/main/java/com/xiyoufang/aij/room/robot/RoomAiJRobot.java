package com.xiyoufang.aij.room.robot;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.room.config.RoomConfig;
import com.xiyoufang.aij.timer.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by 席有芳 on 2019-04-28.
 * 机器人
 *
 * @author 席有芳
 */
public abstract class RoomAiJRobot extends Task {

    private final static Logger LOGGER = LoggerFactory.getLogger(RoomAiJRobot.class);

    /**
     *
     */
    @Override
    public void run() {
        if (AppConfig.use().getConfig().getBool(RoomConfig.ENABLE_ANDROID)) {
            loadAndroid();  //加载机器人
            //searchFreeTables();  //搜索桌子
            //joinTables();        //加入桌子
        }
    }

    /**
     * 加载机器人
     */
    private void loadAndroid() {

    }
}
