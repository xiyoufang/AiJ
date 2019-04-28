package com.xiyoufang.aij.handler;

import com.xiyoufang.aij.event.Event;
import org.tio.core.ChannelContext;
import org.tio.core.Node;

/**
 * Created by 席有芳 on 2018-12-18.
 *
 * @author 席有芳
 */
public class HeadEventHandler extends EventHandler<Event> {

    public HeadEventHandler() {
        super(Event.class);
    }

    /**
     * handle
     *
     * @param event          event
     * @param channelContext channelContext
     */
    public void handle(Event event, ChannelContext channelContext) {

    }
}
