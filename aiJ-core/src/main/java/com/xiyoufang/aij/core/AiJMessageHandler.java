package com.xiyoufang.aij.core;

import com.xiyoufang.aij.event.Event;
import com.xiyoufang.aij.handler.EventHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.core.ChannelContext;
import org.tio.core.Node;
import org.tio.core.Tio;
import org.tio.http.common.HttpRequest;
import org.tio.http.common.HttpResponse;
import org.tio.websocket.common.WsRequest;
import org.tio.websocket.server.handler.IWsMsgHandler;

import java.util.List;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-18.
 *
 * @author 席有芳
 */
public class AiJMessageHandler implements IWsMsgHandler {
    /**
     * LOG
     */
    private final static Logger LOGGER = LoggerFactory.getLogger(AiJMessageHandler.class);
    /**
     * 事件处理链
     */
    private Router router;

    /**
     * 构造
     */
    public AiJMessageHandler() {
        router = new Router();
    }

    /**
     * 获取router
     *
     * @return
     */
    public Router router() {
        return router;
    }

    /**
     * <li>对httpResponse参数进行补充并返回，如果返回null表示不想和对方建立连接，框架会断开连接，如果返回非null，框架会把这个对象发送给对方</li>
     * <li>注：请不要在这个方法中向对方发送任何消息，因为这个时候握手还没完成，发消息会导致协议交互失败。</li>
     * <li>对于大部分业务，该方法只需要一行代码：return httpResponse;</li>
     *
     * @param httpRequest
     * @param httpResponse
     * @param channelContext
     * @return
     * @throws Exception
     * @author tanyaowu
     */
    public HttpResponse handshake(HttpRequest httpRequest, HttpResponse httpResponse, ChannelContext channelContext) throws Exception {
        return httpResponse;
    }

    /**
     * 握手成功后触发该方法
     *
     * @param httpRequest
     * @param httpResponse
     * @param channelContext
     * @throws Exception
     * @author tanyaowu
     */
    public void onAfterHandshaked(HttpRequest httpRequest, HttpResponse httpResponse, ChannelContext channelContext) throws Exception {
        Node clientNode = channelContext.getClientNode();
        LOGGER.info("与{}:{}握手成功", clientNode.getIp(), clientNode.getPort());
    }

    /**
     * <li>当收到Opcode.BINARY消息时，执行该方法。也就是说如何你的ws是基于BINARY传输的，就会走到这个方法</li>
     *
     * @param wsRequest
     * @param bytes
     * @param channelContext
     * @return 可以是WsResponse、byte[]、ByteBuffer、String或null，如果是null，框架不会回消息
     * @throws Exception
     * @author tanyaowu
     */
    public Object onBytes(WsRequest wsRequest, byte[] bytes, ChannelContext channelContext) throws Exception {
        return null;
    }

    /**
     * 当收到Opcode.CLOSE时，执行该方法，业务层在该方法中一般不需要写什么逻辑，空着就好
     *
     * @param wsRequest
     * @param bytes
     * @param channelContext
     * @return 可以是WsResponse、byte[]、ByteBuffer、String或null，如果是null，框架不会回消息
     * @throws Exception
     * @author tanyaowu
     */
    public Object onClose(WsRequest wsRequest, byte[] bytes, ChannelContext channelContext) throws Exception {
        return null;
    }

    /**
     * <li>当收到Opcode.TEXT消息时，执行该方法。也就是说如何你的ws是基于TEXT传输的，就会走到这个方法</li>
     *
     * @param wsRequest
     * @param text
     * @param channelContext
     * @return 可以是WsResponse、byte[]、ByteBuffer、String或null，如果是null，框架不会回消息
     * @throws Exception
     * @author tanyaowu
     */
    public Object onText(WsRequest wsRequest, String text, ChannelContext channelContext) throws Exception {
        try {
            Event event = Event.toEvent(text, Event.class);
            for (EventHandler before : router.before()) {
                if (before.accept(wsRequest, event, channelContext)) {
                    before.handle(wsRequest, event, channelContext);
                }
            }
            Map<Integer, List<EventHandler>> mainRouter = router.router().get(event.getMainType());
            if (mainRouter != null) {
                List<EventHandler> handlers = mainRouter.get(event.getSubType());
                if (handlers != null) {
                    for (EventHandler handler : handlers) {
                        if (handler.accept(wsRequest, event, channelContext)) {
                            handler.handle(wsRequest, event, channelContext);
                        }
                    }
                } else {
                    LOGGER.warn("MainType:{},SubType:{}暂无处理映射", event.getMainType(), event.getSubType());
                }
            } else {
                LOGGER.warn("MainType:{}暂无处理映射", event.getMainType());
            }
            for (EventHandler after : router.after()) {
                if (after.accept(wsRequest, event, channelContext)) {
                    after.handle(wsRequest, event, channelContext);
                }
            }
        } catch (Exception e) {
            LOGGER.error("Event处理异常", e);
            Tio.close(channelContext, e, "Event处理异常");
        }
        return null;
    }
}
