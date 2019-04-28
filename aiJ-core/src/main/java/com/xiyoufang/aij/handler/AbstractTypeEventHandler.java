package com.xiyoufang.aij.handler;

import com.xiyoufang.aij.event.Event;
import org.tio.core.ChannelContext;
import org.tio.websocket.common.WsRequest;

/**
 * Created by 席有芳 on 2018-12-18.
 *
 * @author 席有芳
 */
public abstract class AbstractTypeEventHandler<E extends Event> extends EventHandler<E> {

    /**
     * @param typeClass typeClass
     */
    public AbstractTypeEventHandler(Class<E> typeClass) {
        super(typeClass);
    }
}
