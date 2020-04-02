package com.xiyoufang.aij.mahjong.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.core.EventFactory;
import com.xiyoufang.aij.room.event.CreateTableEvent;
import com.xiyoufang.aij.room.response.LoginEventResponse;
import com.xiyoufang.aij.room.tester.ResponseHandler;
import com.xiyoufang.aij.room.tester.TesterHero;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class LoginResponseHandler extends ResponseHandler<LoginEventResponse> {

    public LoginResponseHandler() {
        super(LoginEventResponse.class);
    }

    /**
     * 转换后的对象Handler
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    @Override
    protected void doHandle(TesterHero testerHero, LoginEventResponse response, WebSocket webSocket) {
        LOGGER.info("用户ID:{},用户名称:{},登录成功!", response.getUserId(), response.getUserName());
        testerHero.setShowId(response.getShowId());
        testerHero.setUserId(response.getUserId());
        testerHero.setUserName(response.getUserName());
        if ("00000001".equals(testerHero.getShowId())) {
            CreateTableEvent event = EventFactory.create(CreateTableEvent.class);
            event.setRuleText("{}");
            webSocket.sendText(event.toJson());
        }
    }
}
