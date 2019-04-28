package com.xiyoufang.aij.room.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.response.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public abstract class ResponseHandler<E extends Response> {

    protected final static Logger LOGGER = LoggerFactory.getLogger(ResponseHandler.class);
    /**
     * 事件class
     */
    protected Class<E> typeClass;

    public ResponseHandler(Class<E> typeClass) {
        this.typeClass = typeClass;
    }


    /**
     * handle
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    public void handle(TesterHero testerHero, Response response, WebSocket webSocket) {
        doHandle(testerHero, Response.toResponse(response.getText(), typeClass), webSocket);
    }

    /**
     * 转换后的对象Handler
     *
     * @param testerHero testerHero
     * @param response   response
     * @param webSocket  webSocket
     */
    protected abstract void doHandle(TesterHero testerHero, E response, WebSocket webSocket);

}
