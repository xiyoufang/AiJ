package com.xiyoufang.aij.mahjong.handler;

import com.xiyoufang.aij.mahjong.MahjongTableAbility;
import com.xiyoufang.aij.mahjong.event.OperateEvent;
import com.xiyoufang.aij.room.handler.AbstractTableEventHandler;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.table.Table;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class OperateEventHandler extends AbstractTableEventHandler<OperateEvent, MahjongTableAbility> {

    /**
     *
     */
    public OperateEventHandler() {
        super(OperateEvent.class);
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
    public void handle(ChannelContext channelContext, OperateEvent event, Table table, MahjongTableAbility tableAbility, Hero hero, int chair) {
        tableAbility.operate(chair, hero, event);
    }
}
