package com.xiyoufang.aij.room.handler;

import com.jfinal.kit.StrKit;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.event.Event;
import com.xiyoufang.aij.handler.AbstractTypeEventHandler;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.hero.HeroManager;
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
        if (StrKit.notBlank(userId) && HeroManager.getInstance().getHero(channelContext.userid) != null) {
            return true;
        }
        Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "尚未登录无权限访问!").toJson(), AppConfig.use().getCharset()));
        return false;
    }

}
