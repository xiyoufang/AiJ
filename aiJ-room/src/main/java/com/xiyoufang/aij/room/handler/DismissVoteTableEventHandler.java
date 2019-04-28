package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.event.DismissVoteTableEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbility;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-02-01.
 * 解散桌子请求
 *
 * @author 席有芳
 */
public class DismissVoteTableEventHandler extends AbstractTableEventHandler<DismissVoteTableEvent, TableAbility> {

    /**
     *
     */
    public DismissVoteTableEventHandler() {
        super(DismissVoteTableEvent.class);
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
    public void handle(ChannelContext channelContext, DismissVoteTableEvent event, Table table, TableAbility tableAbility, Hero hero, int chair) {
        B b = table.dismissVote(hero, event.isAgree());
        if (!b.b) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, (String) b.m).toJson(), AppConfig.use().getCharset()));
        }
    }

}
