package com.xiyoufang.aij.handler;

import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.core.AiJCoreDb;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.event.EmailLoginEvent;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.utils.Pbkdf2;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public abstract class EmailLoginEventHandler extends LoginEventHandler<EmailLoginEvent> {

    public EmailLoginEventHandler() {
        super(EmailLoginEvent.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param event          event
     * @param channelContext channelContext
     */
    @Override
    protected void handle(EmailLoginEvent event, ChannelContext channelContext) {
        Record record = AiJCoreDb.uc().findFirst(AiJCoreDb.uc().getSqlPara("core.user_auth_by_email", event.getEmail()));
        if (record == null) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "邮箱没有绑定账号,请绑定或者注册!").toJson(), AppConfig.use().getCharset()));
            return;
        }
        authenticate(channelContext, event.getPassword(), record);
    }

    /**
     * @param key    key
     * @param record record
     * @return boolean
     */
    protected boolean authenticate(String key, Record record) {
        String encryptedPassword = record.getStr("password");
        String salt = record.getStr("salt");
        return Pbkdf2.authenticate(key, encryptedPassword, salt);
    }


}
