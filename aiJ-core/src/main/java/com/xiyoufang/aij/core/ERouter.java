package com.xiyoufang.aij.core;

import com.xiyoufang.aij.event.Event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class ERouter {

    private final static Logger LOGGER = LoggerFactory.getLogger(ERouter.class);

    public class Type {
        public int mainType;
        public int subType;

        public Type(int mainType, int subType) {
            this.mainType = mainType;
            this.subType = subType;
        }
    }

    private Map<Class<? extends Event>, Type> router = new HashMap<>();

    /**
     * 添加事件映射
     *
     * @param cls      cls
     * @param mainType mainType
     * @param subType  subType
     */
    public void add(Class<? extends Event> cls, int mainType, int subType) {
        if (router.get(cls) != null) {
            LOGGER.error("Event:{},Main{},SubType", cls, mainType, subType);
            throw new RuntimeException("Event只能对应一个命令");
        }
        router.put(cls, new Type(mainType, subType));
    }

    Map<Class<? extends Event>, Type> getRouter() {
        return router;
    }
}
