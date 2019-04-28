package com.xiyoufang.aij.core;

import com.xiyoufang.aij.handler.EventHandler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-19.
 * 路由，将Event指令映射到Event Handler
 *
 * @author 席有芳
 */
public abstract class AbstractRouter<T> {

    /**
     * 路由
     */
    private Map<Integer, Map<Integer, List<T>>> router = new HashMap<>();

    /**
     * 添加路由
     *
     * @param mainType 主指令
     * @param subType  子指令
     * @param handler  处理器
     */
    public void addRouter(int mainType, int subType, T handler) {
        Map<Integer, List<T>> mainRouter = router.get(mainType);
        if (mainRouter == null) {
            mainRouter = new HashMap<>();
            router.put(mainType, mainRouter);
        }
        List<T> handlers = mainRouter.get(subType);
        if (handlers == null) {
            handlers = new ArrayList<>();
            mainRouter.put(subType, handlers);
        }
        handlers.add(handler);
    }

    public Map<Integer, Map<Integer, List<T>>> router() {
        return router;
    }
}
