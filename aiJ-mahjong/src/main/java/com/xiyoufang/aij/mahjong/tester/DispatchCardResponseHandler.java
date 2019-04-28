package com.xiyoufang.aij.mahjong.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.mahjong.response.DispatchCardEventResponse;
import com.xiyoufang.aij.room.tester.ResponseHandler;
import com.xiyoufang.aij.room.tester.TesterHero;
import org.greenrobot.eventbus.EventBus;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class DispatchCardResponseHandler extends ResponseHandler<DispatchCardEventResponse> {

    public DispatchCardResponseHandler() {
        super(DispatchCardEventResponse.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    @Override
    protected void doHandle(TesterHero testerHero, DispatchCardEventResponse response, WebSocket webSocket) {
        if (response.getCard() != -1) {
            EventBus.getDefault().post(response);
        }
    }
}
