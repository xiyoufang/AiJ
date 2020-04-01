package com.xiyoufang.aij.plaza.handler;

import com.xiyoufang.aij.handler.WeiXinLoginEventHandler;
import com.xiyoufang.aij.plaza.user.UserManager;
import com.xiyoufang.aij.user.User;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2019-01-06.
 *
 * @author 席有芳
 */
public class PlazaWeiXinLoginEventHandler extends WeiXinLoginEventHandler {
    /**
     * 登录成功操作
     *
     * @param channelContext channelContext
     * @param user           user
     */
    @Override
    protected void success(ChannelContext channelContext, User user) {
        UserManager.getInstance().success(channelContext, user);
    }

}
