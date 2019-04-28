package com.xiyoufang.aij.handler;

import com.xiyoufang.aij.event.Event;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.core.ChannelContext;
import org.tio.websocket.common.WsRequest;

/**
 * Created by 席有芳 on 2018-12-18.
 *
 * @author 席有芳
 */
public abstract class EventHandler<E extends Event> {

    protected final static Logger LOGGER = LoggerFactory.getLogger(EventHandler.class);

    /**
     * 事件class
     */
    protected Class<E> typeClass;

    public EventHandler(Class<E> typeClass) {
        this.typeClass = typeClass;
    }


    /**
     * handle
     *
     * @param wsRequest      wsRequest
     * @param event          event
     * @param channelContext channelContext
     */
    public void handle(WsRequest wsRequest, Event event, ChannelContext channelContext) {
        handle(Event.toEvent(event.getText(), typeClass), channelContext);
    }

    /**
     * 转换后的对象Handler
     *
     * @param event          event
     * @param channelContext channelContext
     */
    protected abstract void handle(E event, ChannelContext channelContext);

    /**
     * 接受
     *
     * @param wsRequest      wsRequest
     * @param event          event
     * @param channelContext channelContext
     * @return true / false
     */
    public boolean accept(WsRequest wsRequest, Event event, ChannelContext channelContext) {
        return true;
    }

    public Class<E> getTypeClass() {
        return typeClass;
    }
}
