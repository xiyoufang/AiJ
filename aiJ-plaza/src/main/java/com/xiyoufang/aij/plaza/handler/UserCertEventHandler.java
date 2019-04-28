package com.xiyoufang.aij.plaza.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.plaza.event.UserCertEvent;
import com.xiyoufang.aij.plaza.response.UserCertEventResponse;
import com.xiyoufang.aij.response.TipsResponse;
import com.xiyoufang.aij.user.UserService;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-03-03.
 * 用户实名制
 *
 * @author 席有芳
 */
public class UserCertEventHandler extends AuthorizedEventHandler<UserCertEvent> {

    public UserCertEventHandler() {
        super(UserCertEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(UserCertEvent event, String userId, ChannelContext channelContext) {
        if (UserService.me().certification(userId, event.getCertName(), event.getCertCard(), event.getCertMobile(), event.getCertType())) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.success(UserCertEventResponse.class, "实名认证已经提交，请等待系统审核!").toJson(), AppConfig.use().getCharset()));
        } else {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(UserCertEventResponse.class, "实名认证异常，请稍后再试!").toJson(), AppConfig.use().getCharset()));
        }
    }

}
