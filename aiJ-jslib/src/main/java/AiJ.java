
import def.dom.CloseEvent;
import def.dom.Event;
import def.dom.MessageEvent;
import def.dom.WebSocket;
import def.js.JSON;
import def.js.Object;

import java.util.ArrayList;
import java.util.List;
import static def.dom.Globals.window;
import static jsweet.util.Lang.function;

/**
 * Created by 席有芳 on 2018-12-22.
 *
 * @author 席有芳
 */
public class AiJ {

    /**
     * 请求
     */
    public static class AiJEvent {

        /**
         * 主事件类型
         */
        int mainType;
        /**
         * 子事件类型
         */
        int subType;
    }

    /**
     * 响应
     */
    public static class Response {

        /**
         * 主事件类型
         */
        int mainType;
        /**
         * 子事件类型
         */
        int subType;

        /**
         * Code
         */
        int code;
        /**
         * 信息
         */
        String message;
        /**
         * 原始报文
         */
        String text;

    }


    public interface WsEventListener {

        /**
         * 正在连接事件
         *
         * @param aiJWs aiJWs
         */
        void onConnecting(AiJWs aiJWs);

        /**
         * 创建连接事件
         *
         * @param aiJWs             aiJWs
         * @param reconnectAttempts reconnectAttempts
         * @param event             event
         */
        void onOpen(AiJWs aiJWs, int reconnectAttempts, Object event);

        /**
         * 断开连接事件
         *
         * @param aiJWs aiJWs
         * @param event event
         */
        void onClose(AiJWs aiJWs, Object event);

        /**
         * 主动强制关闭事件，不会重连
         *
         * @param aiJWs aiJWs
         * @param event event
         */
        void onForcedClose(AiJWs aiJWs, CloseEvent event);

        /**
         * 错误事件
         *
         * @param aiJWs aiJWs
         * @param event event
         */
        void onError(AiJWs aiJWs, Event event);

        /**
         * 消息事件
         *
         * @param aiJWs        aiJWs
         * @param messageEvent messageEvent
         */
        void onMessage(AiJWs aiJWs, MessageEvent messageEvent);

        /**
         * 超时事件
         *
         * @param aiJWs aiJWs
         */
        void onTimeout(AiJWs aiJWs);

        /**
         * 连接重试事件
         *
         * @param aiJWs             aiJWs
         * @param reconnectAttempts reconnectAttempts
         */
        void onReconnectAttempt(AiJWs aiJWs, int reconnectAttempts);

        /**
         * 重连失败
         *
         * @param aiJWs             aiJWs
         * @param reconnectAttempts reconnectAttempts
         */
        void onReconnectFail(AiJWs aiJWs, int reconnectAttempts);

    }

    /**
     * 响应处理Handler
     */
    public static abstract class ResponseHandler {
        /**
         * 处理逻辑
         *
         * @param aiJWs    aiJWs
         * @param response response
         */
        public abstract void handler(AiJWs aiJWs, Response response);
    }

    /**
     * Ws 配置
     */
    public static class Options {

        /**
         * 连接超时时间
         */
        int connectionTimeout = 10 * 1000;
        /**
         * 重连间隔
         */
        int reconnectInterval = 1000;
        /**
         * 重连decay
         */
        double reconnectDecay = 1.1;
        /**
         * 最大重连间隔
         */
        int maxReconnectInterval = 30 * 1000;
        /**
         * 最大重试次数
         */
        int maxRetries = 10;
        /**
         * 调试模式
         */
        boolean debug = true;
        /**
         * 允许重连
         */
        boolean allowReconnect = true;
        /**
         * 自动打开
         */
        boolean automaticOpen = true;


    }

    public static class Config {
        /**
         * WebSocket URL
         */
        String ws;
        /**
         * 响应路由
         */
        Object mapping = new Object();
        /**
         * 配置
         */
        Options options = new Options();
        /**
         * 事件监听
         */
        WsEventListener wsEventListener = new WsEventListener() {
            @Override
            public void onConnecting(AiJWs aiJWs) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onConnecting");
                }
            }

            @Override
            public void onOpen(AiJWs aiJWs, int reconnectAttempts, Object event) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onOpen");
                }
            }

            @Override
            public void onClose(AiJWs aiJWs, Object event) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onClose");
                }
            }

            @Override
            public void onForcedClose(AiJWs aiJWs, CloseEvent event) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onForcedClose");
                }
            }

            @Override
            public void onError(AiJWs aiJWs, Event event) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onError");
                }
            }

            @Override
            public void onMessage(AiJWs aiJWs, MessageEvent messageEvent) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onMessage");
                }
            }

            @Override
            public void onTimeout(AiJWs aiJWs) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onTimeout");
                }
            }

            @Override
            public void onReconnectAttempt(AiJWs aiJWs, int reconnectAttempts) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onReconnectAttempt");
                }
            }

            @Override
            public void onReconnectFail(AiJWs aiJWs, int reconnectAttempts) {
                if (aiJWs.config.options.debug) {
                    window.console.log("onReconnectFail");
                }
            }
        };

        /**
         * 初始化配置
         *
         * @param ws     ws
         * @param object object
         */
        public Config(String ws, Object object) {
            this.ws = ws;
            this.options.connectionTimeout = object.$get("connectionTimeout") != null ? object.$get("connectionTimeout") : this.options.connectionTimeout;
            this.options.maxRetries = object.$get("maxRetries") != null ? object.$get("maxRetries") : this.options.maxRetries;
            this.options.debug = object.$get("debug") != null ? object.$get("debug") : this.options.debug;
            this.options.allowReconnect = object.$get("allowReconnect") != null ? object.$get("allowReconnect") : this.options.allowReconnect;
            this.options.automaticOpen = object.$get("automaticOpen") != null ? object.$get("automaticOpen") : this.options.automaticOpen;
            this.options.maxReconnectInterval = object.$get("maxReconnectInterval") != null ? object.$get("maxReconnectInterval") : this.options.maxReconnectInterval;
            this.options.reconnectInterval = object.$get("reconnectInterval") != null ? object.$get("reconnectInterval") : this.options.reconnectInterval;
            this.options.reconnectDecay = object.$get("reconnectDecay") != null ? object.$get("reconnectDecay") : this.options.reconnectDecay;
        }


        /**
         * 设置时间监听
         *
         * @param wsEventListener wsEventListener
         */
        public void setWsEventListener(WsEventListener wsEventListener) {
            this.wsEventListener = wsEventListener;
        }


        /**
         * 添加路由
         *
         * @param mainType mainType
         * @param subType  subType
         * @param handler  handler
         */
        public void addRouter(int mainType, int subType, ResponseHandler handler) {
            Object mainRouter = mapping.$get(String.valueOf(mainType));
            if (mainRouter == null) {
                mainRouter = new Object();
                mapping.$set(String.valueOf(mainType), mainRouter);
            }
            List<ResponseHandler> subRouter = mainRouter.$get(String.valueOf(subType));
            if (subRouter == null) {
                subRouter = new ArrayList<>();
                mainRouter.$set(String.valueOf(subType), subRouter);
            }
            subRouter.add(handler);
        }

    }


    public static class AiJWs {
        /**
         * self
         */
        AiJWs self;
        /**
         * Ws
         */
        WebSocket ws;
        /**
         * 配置
         */
        Config config;
        /**
         * 重连次数
         */
        int reconnectAttempts = 0;
        /**
         * 连接状态
         */
        double readyState = -1;
        /**
         * 主动关闭
         */
        boolean forcedClose = false;
        /**
         * 超时
         */
        boolean timedOut = false;

        /**
         * 配置
         *
         * @param config config
         */
        AiJWs(Config config) {
            self = this;
            this.config = config;
            if (this.config.options.automaticOpen) {
                connect(false);
            }
        }

        public void reconnect() {
            this.reconnectAttempts++;
            if (this.reconnectAttempts > this.config.options.maxRetries) {
                config.wsEventListener.onReconnectFail(this, this.reconnectAttempts);
                return;
            }
            config.wsEventListener.onReconnectAttempt(this, this.reconnectAttempts);
            double timeout = self.config.options.reconnectInterval * Math.pow(self.config.options.reconnectDecay, self.reconnectAttempts);
            window.setTimeout(function(() -> self.connect(true)), timeout > self.config.options.maxReconnectInterval ? self.config.options.maxReconnectInterval : timeout);
        }

        /**
         * 连接
         *
         * @param reconnectAttempt 是否重连
         */
        public void connect(boolean reconnectAttempt) {
            if (!reconnectAttempt) {
                this.reconnectAttempts = 0;
            }
            //初始化Ws
            ws = new WebSocket(config.ws);
            forcedClose = false;
            readyState = ws.CONNECTING;
            config.wsEventListener.onConnecting(self);
            //设置超时定时器
            double timeoutHandle = window.setTimeout(function(() -> {
                timedOut = true;
                config.wsEventListener.onTimeout(self);
                ws.close();
                timedOut = false;
            }), config.options.connectionTimeout);
            //打开事件
            ws.onopen = new java.util.function.Function<Event, java.lang.Object>() {
                @Override
                public java.lang.Object apply(Event event) {
                    window.clearTimeout(timeoutHandle);    //清除超时时间
                    self.readyState = ws.OPEN;
                    self.reconnectAttempts = 0;
                    config.wsEventListener.onOpen(self, self.reconnectAttempts, event);
                    return new Object();
                }
            };
            //关闭事件
            ws.onclose = new java.util.function.Function<CloseEvent, java.lang.Object>() {
                @Override
                public java.lang.Object apply(CloseEvent closeEvent) {
                    window.clearTimeout(timeoutHandle);    //清除超时时间
                    if (forcedClose) {              //强制关闭不重连
                        self.readyState = ws.CLOSED;
                        config.wsEventListener.onForcedClose(self, closeEvent);
                    } else {
                        if (!reconnectAttempt && !timedOut) {   //服务器断开，
                            config.wsEventListener.onClose(self, closeEvent);
                        }
                        reconnect();
                    }
                    return new Object();
                }
            };
            //错误事件
            ws.onerror = new java.util.function.Function<Event, java.lang.Object>() {
                @Override
                public java.lang.Object apply(Event event) {
                    window.clearTimeout(timeoutHandle);    //清除超时时间
                    config.wsEventListener.onError(self, event);
                    return new Object();
                }
            };
            //接收事件
            ws.onmessage = new java.util.function.Function<MessageEvent, java.lang.Object>() {
                @Override
                public java.lang.Object apply(MessageEvent messageEvent) {
                    if (config.options.debug) {
                        window.console.log("接收信息:" + JSON.stringify(messageEvent.data));
                    }
                    try {
                        Response response = (Response) JSON.parse((String) messageEvent.data);
                        if (response != null) {
                            response.text = (String) messageEvent.data;
                            Object mainTypeMapping = config.mapping.$get(String.valueOf(response.mainType));
                            if (mainTypeMapping != null) {
                                List<ResponseHandler> functions = mainTypeMapping.$get(String.valueOf(response.subType));
                                if (functions != null) {
                                    for (int i = 0; i < functions.size(); i++) {
                                        functions.get(i).handler(self, response);
                                    }
                                } else {
                                    if (config.options.debug) {
                                        window.console.log("mainType:" + response.mainType + " subType:" + response.subType + " no mapping");
                                    }
                                }
                            } else {
                                if (config.options.debug) {
                                    window.console.log("mainType:" + response.mainType + " no mapping");
                                }
                            }

                        }
                    } finally {
                        config.wsEventListener.onMessage(self, messageEvent);
                    }
                    return new Object();
                }
            };
        }

        /**
         * 发送数据
         *
         * @param event event
         */
        void send(AiJEvent event) {
            if (config.options.debug) {
                window.console.log("发送信息:" + JSON.stringify(event));
            }
            ws.send(JSON.stringify(event));
        }

        /**
         * 关闭链接
         */
        void close() {
            forcedClose = true;
            ws.close();
        }

    }

    private AiJWs aiJWs;

    public AiJ(Config config) {
        aiJWs = new AiJWs(config);
    }

    public void send(AiJEvent event) {
        aiJWs.send(event);
    }


}
