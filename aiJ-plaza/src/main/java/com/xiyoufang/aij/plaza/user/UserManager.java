package com.xiyoufang.aij.plaza.user;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.plaza.response.LoginEventResponse;
import com.xiyoufang.aij.user.User;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.utils.lock.SetWithLock;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-01-06.
 *
 * @author 席有芳
 */
public class UserManager {
    /**
     * 实例
     */
    private static UserManager instance;

    public synchronized static UserManager getInstance() {
        if (instance == null) {
            instance = new UserManager();
        }
        return instance;
    }

    /**
     * 登录成功
     *
     * @param channelContext channelContext
     * @param user           user
     */
    public void success(ChannelContext channelContext, User user) {
        String userId = user.getUserId();
        SetWithLock<ChannelContext> objs = Tio.getByUserid(channelContext.tioConfig, userId);
        Tio.unbindUser(channelContext); //先解绑
        channelContext.setUserid(userId); //用户名称绑定
        LoginEventResponse response = ResponseFactory.success(LoginEventResponse.class, "登录成功");
        response.setShowId(user.getShowId());
        response.setUserId(user.getUserId());
        response.setUserName(user.getUserName());
        response.setNickName(user.getNickName());
        response.setAvatar(user.getAvatar());
        response.setGender(user.getGender());
        response.setLatitude(user.getLatitude());
        response.setLongitude(user.getLongitude());
        response.setAddress(user.getAddress());
        response.setDistributorId(user.getDistributorId());
        response.setIp(user.getIp());
        response.setCertStatus(user.getCertStatus());
        Tio.send(channelContext, WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
    }

}
