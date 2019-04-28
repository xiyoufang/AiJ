package com.xiyoufang.aij.mahjong.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.core.EventFactory;
import com.xiyoufang.aij.mahjong.response.EndEventResponse;
import com.xiyoufang.aij.room.event.CreateTableEvent;
import com.xiyoufang.aij.room.tester.ResponseHandler;
import com.xiyoufang.aij.room.tester.TesterHero;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class EndEventResponseHandler extends ResponseHandler<EndEventResponse> {

    public EndEventResponseHandler() {
        super(EndEventResponse.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    @Override
    protected void doHandle(TesterHero testerHero, EndEventResponse response, WebSocket webSocket) {
        if ("1".equals(testerHero.getUserId())) {
            CreateTableEvent event = EventFactory.create(CreateTableEvent.class);
            event.setRuleText("{}");
            webSocket.sendText(event.toJson());
        }
    }
}
