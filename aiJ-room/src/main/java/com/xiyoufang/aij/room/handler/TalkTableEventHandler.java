package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.room.event.TalkEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbility;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2018-12-21.
 * 语音
 *
 * @author 席有芳
 */
public class TalkTableEventHandler extends AbstractTableEventHandler<TalkEvent, TableAbility> {

    public TalkTableEventHandler() {
        super(TalkEvent.class);
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
    public void handle(ChannelContext channelContext, TalkEvent event, Table table, TableAbility tableAbility, Hero hero, int chair) {


    }
}
