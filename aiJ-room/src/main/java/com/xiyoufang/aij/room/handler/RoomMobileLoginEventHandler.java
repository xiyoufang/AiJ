package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.handler.MobileLoginEventHandler;
import com.xiyoufang.aij.room.hero.HeroManager;
import com.xiyoufang.aij.user.User;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2019-01-06.
 *
 * @author 席有芳
 */
public class RoomMobileLoginEventHandler extends MobileLoginEventHandler {

    /**
     * 登录成功操作
     *
     * @param channelContext channelContext
     * @param user           user
     */
    @Override
    protected void success(ChannelContext channelContext, User user) {
        HeroManager.getInstance().success(channelContext,user);
    }
}
