package com.xiyoufang.aij.mahjong.handler;

import com.xiyoufang.aij.mahjong.MahjongTableAbility;
import com.xiyoufang.aij.mahjong.event.OutCardEvent;
import com.xiyoufang.aij.room.handler.AbstractTableEventHandler;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.table.Table;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class OutCardEventHandler extends AbstractTableEventHandler<OutCardEvent, MahjongTableAbility> {

    public OutCardEventHandler() {
        super(OutCardEvent.class);
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
    public void handle(ChannelContext channelContext, OutCardEvent event, Table table, MahjongTableAbility tableAbility, Hero hero, int chair) {
        tableAbility.outCard(chair, hero, event);
    }

}
