package com.xiyoufang.aij.handler;

import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.core.AiJCoreDb;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.event.MobileLoginEvent;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.user.UserService;
import com.xiyoufang.aij.utils.Pbkdf2;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public abstract class MobileLoginEventHandler extends LoginEventHandler<MobileLoginEvent> {

    public MobileLoginEventHandler() {
        super(MobileLoginEvent.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param event          event
     * @param channelContext channelContext
     */
    @Override
    protected void handle(MobileLoginEvent event, ChannelContext channelContext) {
        Record record = UserService.me().findUserByMobile(event.getMobile());
        if (record == null) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "手机号码没有绑定账号,请绑定或者注册!").toJson(), AppConfig.use().getCharset()));
            return;
        }
        authenticate(channelContext, event.getPassword(), record);
    }

    /**
     * 授权
     *
     * @param key    key
     * @param record record
     * @return boolean
     */
    @Override
    protected boolean authenticate(String key, Record record) {
        return UserService.me().authenticate(key, record);
    }
}
