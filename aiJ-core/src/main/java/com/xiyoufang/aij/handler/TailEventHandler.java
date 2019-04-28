package com.xiyoufang.aij.handler;

import com.xiyoufang.aij.event.Event;
import org.tio.core.ChannelContext;
import org.tio.websocket.common.WsRequest;

/**
 * Created by 席有芳 on 2018-12-18.
 *
 * @author 席有芳
 */
public class TailEventHandler extends EventHandler<Event> {

    public TailEventHandler() {
        super(Event.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param event          event
     * @param channelContext channelContext
     */
    @Override
    protected void handle(Event event, ChannelContext channelContext) {

    }
}
