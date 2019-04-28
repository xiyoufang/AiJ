package com.xiyoufang.aij.mahjong.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.room.response.LoginNotifyResponse;
import com.xiyoufang.aij.room.tester.ResponseHandler;
import com.xiyoufang.aij.room.tester.TesterHero;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class LoginNotifyResponseHandler extends ResponseHandler<LoginNotifyResponse> {

    public LoginNotifyResponseHandler() {
        super(LoginNotifyResponse.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    @Override
    protected void doHandle(TesterHero testerHero, LoginNotifyResponse response, WebSocket webSocket) {

    }
}
