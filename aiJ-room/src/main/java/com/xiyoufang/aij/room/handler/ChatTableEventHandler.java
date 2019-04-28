package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.room.event.ChatEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.response.ChatEventResponse;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbility;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2018-12-21.
 * 文本
 *
 * @author 席有芳
 */
public class ChatTableEventHandler extends AbstractTableEventHandler<ChatEvent, TableAbility> {

    public ChatTableEventHandler() {
        super(ChatEvent.class);
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
    public void handle(ChannelContext channelContext, ChatEvent event, Table table, TableAbility tableAbility, Hero hero, int chair) {
        ChatEventResponse response = ResponseFactory.success(ChatEventResponse.class, "聊天信息");
        response.setContent(event.getContent());
        response.setChair(chair);
        table.sendTable(response);
    }
}
