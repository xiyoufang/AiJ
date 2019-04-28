package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.room.event.ClientReadyEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbility;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2019-01-17.
 * 客户端已经准备好的事件
 *
 * @author 席有芳
 */
public class ClientReadyEventHandler extends AbstractTableEventHandler<ClientReadyEvent, TableAbility> {

    public ClientReadyEventHandler() {
        super(ClientReadyEvent.class);
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
    public void handle(ChannelContext channelContext, ClientReadyEvent event, Table table, TableAbility tableAbility, Hero hero, int chair) {
        table.clientReady(hero, chair);
    }
}
