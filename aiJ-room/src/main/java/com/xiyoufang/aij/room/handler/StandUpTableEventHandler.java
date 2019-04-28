package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.event.StandUpTableEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbility;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-01-25.
 * 起立处理
 *
 * @author 席有芳
 */
public class StandUpTableEventHandler extends AbstractTableEventHandler<StandUpTableEvent, TableAbility> {

    /**
     *
     */
    public StandUpTableEventHandler() {
        super(StandUpTableEvent.class);
    }

    /**
     * handler
     *
     * @param channelContext channelContext
     * @param event          event
     * @param table          table
     * @param tableAbility   tableAbility
     * @param hero           hero
     * @param chair          chair
     */
    @Override
    public void handle(ChannelContext channelContext, StandUpTableEvent event, Table table, TableAbility tableAbility, Hero hero, int chair) {
        B b = table.standUp(hero, chair);
        if (!b.b) {   //起立失败
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, (String) b.m).toJson(), AppConfig.use().getCharset()));
        }

    }
}
