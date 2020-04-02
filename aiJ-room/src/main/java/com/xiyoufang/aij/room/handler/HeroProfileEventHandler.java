package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.event.HeroProfileEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.hero.HeroManager;
import com.xiyoufang.aij.room.response.HeroProfileEventResponse;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-01-24.
 * 获取玩家信息
 *
 * @author 席有芳
 */
public class HeroProfileEventHandler extends AuthorizedEventHandler<HeroProfileEvent> {

    public HeroProfileEventHandler() {
        super(HeroProfileEvent.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param event          event
     * @param channelContext channelContext
     */
    @Override
    protected void handle(HeroProfileEvent event, ChannelContext channelContext) {
        String userId = event.getUserId();
        Hero hero = HeroManager.getInstance().getHero(userId);
        if (hero == null) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "玩家未进入游戏").toJson(), AppConfig.use().getCharset()));
            return;
        }
        HeroProfileEventResponse response = ResponseFactory.success(HeroProfileEventResponse.class, "获取玩家信息成功");
        response.setShowId(hero.getShowId());
        response.setAvatar(hero.getAvatar());
        response.setGender(hero.getGender());
        response.setNickName(hero.getNickName());
        response.setUserName(hero.getUserName());
        response.setUserId(hero.getUserId());
        response.setAddress(hero.getAddress());
        response.setLatitude(hero.getLatitude());
        response.setLongitude(hero.getLongitude());
        response.setCertStatus(hero.getCertStatus());
        response.setDistributorId(hero.getDistributorId());
        response.setIp(hero.getIp());
        Tio.send(channelContext, WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
    }
}
