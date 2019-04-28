package com.xiyoufang.aij.plaza.handler;

import com.jfinal.kit.StrKit;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.event.Event;
import com.xiyoufang.aij.handler.AbstractTypeEventHandler;
import com.xiyoufang.aij.response.CommonResponse;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsRequest;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public abstract class AuthorizedEventHandler<E extends Event> extends AbstractTypeEventHandler<E> {

    public AuthorizedEventHandler(Class<E> typeClass) {
        super(typeClass);
    }


    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    protected abstract void handle(E event, String userId, ChannelContext channelContext);

    /**
     * 转换后的对象Handler
     *
     * @param event          event
     * @param channelContext channelContext
     */
    @Override
    protected void handle(E event, ChannelContext channelContext) {
        handle(event, channelContext.userid, channelContext);
    }


    /**
     * 接受
     *
     * @param wsRequest      wsRequest
     * @param event          event
     * @param channelContext channelContext
     * @return true / false
     */
    @Override
    public boolean accept(WsRequest wsRequest, Event event, ChannelContext channelContext) {
        String userId = channelContext.userid;
        if (StrKit.notBlank(userId)) {
            return true;
        }
        Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "尚未登录无权限访问!").toJson(), AppConfig.use().getCharset()));
        return false;
    }

}
