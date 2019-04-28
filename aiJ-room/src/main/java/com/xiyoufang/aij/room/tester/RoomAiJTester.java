package com.xiyoufang.aij.room.tester;

import com.neovisionaries.ws.client.*;
import com.xiyoufang.aij.core.EventFactory;
import com.xiyoufang.aij.response.Response;
import com.xiyoufang.aij.event.MobileLoginEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.MessageFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Created by 席有芳 on 2018-12-24.
 *
 * @author 席有芳
 */
public abstract class RoomAiJTester {

    private final static Logger LOGGER = LoggerFactory.getLogger(RoomAiJTester.class);

    /**
     * 测试配置参数
     */
    private TesterConfig testerConfig;

    /**
     * 配置测试参数
     *
     * @param testerConfig testerConfig
     */
    protected abstract void testerConfig(TesterConfig testerConfig);

    /**
     * 配置测试用的路由
     *
     * @param tRouter tRouter
     */
    protected abstract void configTRouter(TRouter tRouter);

    /**
     * 连接websocket之前
     */
    protected abstract void onAfterWs();

    /**
     * 开始回调
     */
    protected abstract void onStart();

    /**
     * 路由
     */
    private TRouter tRouter = new TRouter();
    /**
     * Ws与hero映射
     */
    private Map<WebSocket, TesterHero> wsTesterHeroes = new ConcurrentHashMap<>();

    /**
     * 开始执行
     */
    public void start() throws Exception {
        testerConfig = new TesterConfig();
        testerConfig(testerConfig);
        configTRouter(tRouter);
        onAfterWs();
        createTesterWsClient();
        onStart();
    }

    /**
     * 创建客户端
     */
    private void createTesterWsClient() throws Exception {
        Set<Map.Entry<String, TesterHero>> entries = TesterHeroManager.getInstance().getTesterHeroes().entrySet();
        WebSocketFactory factory = new WebSocketFactory();
        int size = entries.size();
        final CountDownLatch downLatch = new CountDownLatch(size);
        final AtomicInteger connectedCount = new AtomicInteger();
        for (Map.Entry<String, TesterHero> testerHeroEntry : entries) {
            final TesterHero testerHero = testerHeroEntry.getValue();
            WebSocket ws = factory.createSocket(testerConfig.getWsUrl(), 5 * 1000).addListener(new WebSocketAdapter() {
                @Override
                public void onConnected(WebSocket websocket, Map<String, List<String>> headers) {
                    LOGGER.info("测试MOBILE:{}，连接成功!", testerHero.getMobile());
                    wsTesterHeroes.put(websocket, testerHero);
                    TesterHeroManager.getInstance().bindWebSocket(testerHero, websocket);
                    MobileLoginEvent mobileLoginEvent = EventFactory.create(MobileLoginEvent.class);
                    mobileLoginEvent.setMobile(testerHero.getMobile());
                    mobileLoginEvent.setPassword(testerHero.getPassword());
                    websocket.sendText(mobileLoginEvent.toJson());
                    connectedCount.addAndGet(1);
                    downLatch.countDown();
                }

                @Override
                public void onTextMessage(WebSocket websocket, String text) {
                    LOGGER.debug("{}接收到信息:{}", testerHero.getMobile(), text);
                    try {
                        Response response = Response.toResponse(text, Response.class);
                        Map<Integer, List<ResponseHandler>> mainHandlers = tRouter.router().get(response.getMainType());
                        if (mainHandlers != null) {
                            List<ResponseHandler> subHandlers = mainHandlers.get(response.getSubType());
                            if (subHandlers != null) {
                                for (ResponseHandler handler : subHandlers) {
                                    handler.handle(wsTesterHeroes.get(websocket), response, websocket);
                                }
                            }
                        }
                    } catch (Exception e) {
                        LOGGER.error("报文处理异常!", e);
                    }
                }

                @Override
                public void onConnectError(WebSocket websocket, WebSocketException exception) {
                    LOGGER.error("连接失败!", exception);
                    downLatch.countDown();
                }

                @Override
                public void onDisconnected(WebSocket websocket, WebSocketFrame serverCloseFrame, WebSocketFrame clientCloseFrame, boolean closedByServer) {
                    LOGGER.info("断开链接!");
                }

                @Override
                public void onError(WebSocket websocket, WebSocketException cause) {
                    LOGGER.error("发生错误!", cause);
                }

            }).addExtension(WebSocketExtension.PERMESSAGE_DEFLATE).connect();
        }
        downLatch.await(10, TimeUnit.SECONDS);
        int intValue = connectedCount.intValue();
        if (intValue != size) {
            LOGGER.error("WS连接完成,一共{}个测试者需要连接,{}个连接成功,{}个连接失败", size, intValue, size - intValue);
            throw new RuntimeException(MessageFormat.format("一共{0}个测试者需要连接,{1}个连接成功,{2}个连接失败", size, intValue, size - intValue));
        }
        LOGGER.info("WS连接完成,一共{}个测试者需要连接,{}个连接成功,{}个连接失败", size, intValue, size - intValue);
    }

}
