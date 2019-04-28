package com.xiyoufang.aij.mahjong.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.core.EventFactory;
import com.xiyoufang.aij.room.event.ClientReadyEvent;
import com.xiyoufang.aij.room.event.SitDownTableEvent;
import com.xiyoufang.aij.room.response.JoinTableEventResponse;
import com.xiyoufang.aij.room.tester.ResponseHandler;
import com.xiyoufang.aij.room.tester.TesterHero;
import org.greenrobot.eventbus.EventBus;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class JoinTableResponseHandler extends ResponseHandler<JoinTableEventResponse> {

    public JoinTableResponseHandler() {
        super(JoinTableEventResponse.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    @Override
    protected void doHandle(TesterHero testerHero, JoinTableEventResponse response, WebSocket webSocket) {
        int chair = response.getChair();
        testerHero.setChair(chair); //绑定椅子
        EventBus.getDefault().post(response);
        webSocket.sendText(EventFactory.create(ClientReadyEvent.class).toJson()); //发送客户端准备好的事件
        webSocket.sendText(EventFactory.create(SitDownTableEvent.class).toJson()); //发送坐下事件
    }
}
