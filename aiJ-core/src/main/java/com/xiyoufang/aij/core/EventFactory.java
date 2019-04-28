package com.xiyoufang.aij.core;

import com.xiyoufang.aij.event.Event;
import com.xiyoufang.aij.handler.EventHandler;
import org.fest.reflect.core.Reflection;

import java.util.List;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class EventFactory {

    private static ERouter eRouter;

    /**
     * 初始化
     *
     * @param router router
     */
    @SuppressWarnings("unchecked")
    static void init(Router router) {
        Map<Integer, Map<Integer, List<EventHandler>>> routers = router.router();
        eRouter = new ERouter();
        for (Map.Entry<Integer, Map<Integer, List<EventHandler>>> mapEntry : routers.entrySet()) {
            Integer mainType = mapEntry.getKey();
            for (Map.Entry<Integer, List<EventHandler>> entry : mapEntry.getValue().entrySet()) {
                Integer subType = entry.getKey();
                for (EventHandler handler : entry.getValue()) {
                    eRouter.add(handler.getTypeClass(), mainType, subType);
                }
            }
        }
    }

    /**
     * 创建Response
     *
     * @param cls cls
     * @param <T> T
     * @return Response
     */
    public static <T extends Event> T create(Class<T> cls) {
        T t = Reflection.constructor().in(cls).newInstance();
        ERouter.Type type = eRouter.getRouter().get(cls);
        t.setMainType(type.mainType);
        t.setSubType(type.subType);
        return t;
    }

}
