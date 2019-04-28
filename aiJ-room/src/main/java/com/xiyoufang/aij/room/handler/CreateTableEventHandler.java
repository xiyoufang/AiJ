package com.xiyoufang.aij.room.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.event.CreateTableEvent;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.hero.HeroManager;
import com.xiyoufang.aij.room.response.CreateTableEventResponse;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableManager;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public class CreateTableEventHandler extends AuthorizedEventHandler<CreateTableEvent> {

    public CreateTableEventHandler() {
        super(CreateTableEvent.class);
    }

    /**
     * handle
     *
     * @param event          event
     * @param channelContext channelContext
     */
    public void handle(CreateTableEvent event, ChannelContext channelContext) {
        Hero hero = HeroManager.getInstance().getHero(channelContext.userid);
        String ruleText = event.getRuleText();
        B b = TableManager.getInstance().create(hero, ruleText);
        if (b.b) {
            CreateTableEventResponse response = ResponseFactory.success(CreateTableEventResponse.class, "创建桌子");
            response.setTableNo(((Table) b.m).getTableNo());
            Tio.send(channelContext, WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
            return;
        }
        Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, (String) b.m).toJson(), AppConfig.use().getCharset()));
    }
}
