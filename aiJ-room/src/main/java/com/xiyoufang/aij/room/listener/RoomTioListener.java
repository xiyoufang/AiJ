package com.xiyoufang.aij.room.listener;

import com.jfinal.kit.StrKit;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.TioListener;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.hero.HeroManager;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2019-01-25.
 *
 * @author 席有芳
 */
public class RoomTioListener implements TioListener {

    /**
     * 日志
     */
    private final static Logger LOGGER = LoggerFactory.getLogger(RoomTioListener.class);

    /**
     * 连接断开之前
     *
     * @param channelContext channelContext
     * @param throwable      throwable
     * @param remark         remark
     * @param isRemove       isRemove
     */
    @Override
    public void onClose(ChannelContext channelContext, Throwable throwable, String remark, boolean isRemove) {
        if (StrKit.notBlank(channelContext.userid)) {
            LOGGER.info("当前ID为:{}的玩家掉线!", channelContext.userid);
            Hero hero = HeroManager.getInstance().getHero(channelContext.userid);
            Table table = TableManager.getInstance().getCurrTable(hero);
            if (table != null) {
                B b = table.offline(hero, table.getChair(hero));
                if (!b.b) {
                    LOGGER.info("离线失败信息:{}", b.m);
                }
            }
        }
    }

}
