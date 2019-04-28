package com.xiyoufang.aij.room.monitor;

import com.xiyoufang.aij.timer.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class MonitorTask extends Task {

    private final static Logger LOGGER = LoggerFactory.getLogger(MonitorTask.class);

    @Override
    public void run() {
        LOGGER.info("执行MonitorTask");
    }

}
