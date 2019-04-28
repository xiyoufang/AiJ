package com.xiyoufang.aij.room.robot;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.room.config.RoomConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by 席有芳 on 2019-04-28.
 * 机器人
 *
 * @author 席有芳
 */
public abstract class RoomAiJRobot implements Runnable {

    private final static Logger LOGGER = LoggerFactory.getLogger(RoomAiJRobot.class);

    /**
     * 开启
     */
    public void start() {
        new Thread(this).start();
    }

    /**
     *
     */
    @Override
    public void run() {
        while (AppConfig.use().getConfig().getBool(RoomConfig.ENABLE_ANDROID)) {
            try {
                //检测房间
                Thread.sleep(100);
            } catch (Exception e) {
                LOGGER.warn("interrupted exception", e);
            }
        }
    }
}
