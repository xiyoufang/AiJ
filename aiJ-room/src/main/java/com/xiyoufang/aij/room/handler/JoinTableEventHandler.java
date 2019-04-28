package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.event.JoinTableEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.hero.HeroManager;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableManager;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

import java.text.MessageFormat;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public class JoinTableEventHandler extends AuthorizedEventHandler<JoinTableEvent> {

    public JoinTableEventHandler() {
        super(JoinTableEvent.class);
    }

    /**
     * handle
     *
     * @param event          event
     * @param channelContext channelContext
     */
    public void handle(JoinTableEvent event, ChannelContext channelContext) {
        Hero hero = HeroManager.getInstance().getHero(channelContext.userid);
        int tableNo = event.getTableNo();
        Table table = TableManager.getInstance().getTable(tableNo);
        if (table == null) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, MessageFormat.format("编号为的{0}桌子不存在!", String.valueOf(tableNo))).toJson(), AppConfig.use().getCharset()));
            return;
        }
        B b = table.enter(hero);
        if (!b.b) {   //加入失败
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, (String) b.m).toJson(), AppConfig.use().getCharset()));
        }
    }
}
