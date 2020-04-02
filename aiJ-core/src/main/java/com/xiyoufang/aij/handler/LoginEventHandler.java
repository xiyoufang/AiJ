package com.xiyoufang.aij.handler;

import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.event.Event;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.user.User;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

import java.text.DecimalFormat;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public abstract class LoginEventHandler<E extends Event> extends EventHandler<E> {

    protected final static String LOGIN_GROUP = "_LOGIN_GROUP_";

    public LoginEventHandler(Class<E> typeClass) {
        super(typeClass);
    }

    /**
     * 授权时候通过
     *
     * @param key    key
     * @param record record
     * @return boolean
     */
    protected abstract boolean authenticate(String key, Record record);

    /**
     * 授权
     *
     * @param channelContext channelContext
     * @param key            key
     * @param record         record
     */
    protected void authenticate(ChannelContext channelContext, String key, Record record) {
        if (authenticate(key, record)) {
            Long id = record.getLong("id");
            String userId = record.getStr("user_id");
            String userName = record.getStr("user_name");
            String nickName = record.getStr("nick_name");
            Integer gender = record.getInt("gender");
            String avatar = record.getStr("avatar");
            String address = record.getStr("address");
            Double longitude = record.getDouble("longitude");
            Double latitude = record.getDouble("latitude");
            String distributorId = record.getStr("distributor_id");
            String certStatus = record.getStr("cert_status");
            String ip = record.getStr("ip");
            User user = new User();
            user.setShowId(new DecimalFormat("00000000").format(id));
            user.setUserName(userName);
            user.setUserId(userId);
            user.setNickName(nickName);
            user.setGender(gender);
            user.setAvatar(avatar);
            user.setAddress(address);
            user.setLongitude(longitude);
            user.setLatitude(latitude);
            user.setDistributorId(distributorId);
            user.setIp(ip);
            user.setCertStatus(certStatus);
            success(channelContext, user);
        } else {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "用户名或密码错误!").toJson(), AppConfig.use().getCharset()));
        }
    }


    /**
     * 登录成功操作
     *
     * @param channelContext channelContext
     * @param user           user
     */
    protected abstract void success(ChannelContext channelContext, User user);
}
