package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.event.Event;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.hero.HeroManager;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbility;
import com.xiyoufang.aij.room.table.TableManager;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2018-12-21.
 * 所有桌子内的指令继承此类，例如文字聊天，语音，游戏操作
 *
 * @author 席有芳
 */
public abstract class AbstractTableEventHandler<E extends Event, T extends TableAbility> extends AuthorizedEventHandler<E> {


    public AbstractTableEventHandler(Class<E> typeClass) {
        super(typeClass);
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
    public abstract void handle(ChannelContext channelContext, E event, Table table, T tableAbility, Hero hero, int chair);

    /**
     * handle
     *
     * @param event          event
     * @param channelContext channelContext
     */
    @Override
    @SuppressWarnings("unchecked")
    public void handle(E event, ChannelContext channelContext) {
        Hero hero = HeroManager.getInstance().getHero(channelContext.userid);
        Table table = TableManager.getInstance().getCurrTable(hero);
        if (table == null) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "当前尚未加入任何桌子!").toJson(), AppConfig.use().getCharset()));
            return;
        }
        handle(channelContext, event, table, (T) table.getTableAbility(), hero, table.getChair(hero));
    }

}
