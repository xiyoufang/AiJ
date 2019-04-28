package com.xiyoufang.aij.mahjong.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.core.EventFactory;
import com.xiyoufang.aij.room.event.JoinTableEvent;
import com.xiyoufang.aij.room.response.CreateTableEventResponse;
import com.xiyoufang.aij.room.tester.ResponseHandler;
import com.xiyoufang.aij.room.tester.TesterHero;
import com.xiyoufang.aij.room.tester.TesterHeroManager;
import org.greenrobot.eventbus.EventBus;

import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class CreateTableResponseHandler extends ResponseHandler<CreateTableEventResponse> {

    public CreateTableResponseHandler() {
        super(CreateTableEventResponse.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    @Override
    protected void doHandle(TesterHero testerHero, CreateTableEventResponse response, WebSocket webSocket) {
        int tableNo = response.getTableNo();
        for (Map.Entry<String, TesterHero> testerHeroEntry : TesterHeroManager.getInstance().getTesterHeroes().entrySet()) {
            JoinTableEvent event = EventFactory.create(JoinTableEvent.class);
            event.setTableNo(tableNo);
            testerHeroEntry.getValue().getWebSocket().sendText(event.toJson());
        }
        EventBus.getDefault().post(response);
    }
}
