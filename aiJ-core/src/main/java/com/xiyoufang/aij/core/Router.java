package com.xiyoufang.aij.core;

import com.xiyoufang.aij.handler.EventHandler;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-19.
 * 路由，将Event指令映射到Event Handler
 *
 * @author 席有芳
 */
public class Router extends AbstractRouter<EventHandler> {

    /**
     * 之前
     */
    private List<EventHandler> before = new ArrayList<EventHandler>();
    /**
     * 之后
     */
    private List<EventHandler> after = new ArrayList<EventHandler>();

    /**
     * 路由之前执行的Handler
     *
     * @param eventHandler 处理器
     */
    public void beforeRouter(EventHandler eventHandler) {
        before.add(eventHandler);
    }

    /**
     * 路由之后执行的Handler
     *
     * @param eventHandler 处理器
     */
    public void afterRouter(EventHandler eventHandler) {
        after.add(eventHandler);
    }

    public List<EventHandler> before() {
        return before;
    }

    public List<EventHandler> after() {
        return after;
    }

}
