/* Generated from Java with JSweet 2.0.1 - http://www.jsweet.org */
/**
 * Created by 席有芳 on 2018-12-22.
 *
 * @author 席有芳
 * @param {AiJ.Config} config
 * @class
 */
export class AiJ {
    /*private*/ aiJWs : AiJ.AiJWs;

    public constructor(config : AiJ.Config) {
        if(this.aiJWs===undefined) this.aiJWs = null;
        this.aiJWs = new AiJ.AiJWs(config);
    }

    public send(event : AiJ.AiJEvent) {
        this.aiJWs.send(event);
    }
}
AiJ["__class"] = "AiJ";


export namespace AiJ {

    /**
     * 请求
     * @class
     */
    export class AiJEvent {
        /**
         * 主事件类型
         */
        mainType : number;

        /**
         * 子事件类型
         */
        subType : number;

        constructor() {
            if(this.mainType===undefined) this.mainType = 0;
            if(this.subType===undefined) this.subType = 0;
        }
    }
    AiJEvent["__class"] = "AiJ.AiJEvent";


    /**
     * 响应
     * @class
     */
    export class Response {
        /**
         * 主事件类型
         */
        mainType : number;

        /**
         * 子事件类型
         */
        subType : number;

        /**
         * Code
         */
        code : number;

        /**
         * 信息
         */
        message : string;

        /**
         * 原始报文
         */
        text : string;

        constructor() {
            if(this.mainType===undefined) this.mainType = 0;
            if(this.subType===undefined) this.subType = 0;
            if(this.code===undefined) this.code = 0;
            if(this.message===undefined) this.message = null;
            if(this.text===undefined) this.text = null;
        }
    }
    Response["__class"] = "AiJ.Response";


    export interface WsEventListener {
        /**
         * 正在连接事件
         *
         * @param {AiJ.AiJWs} aiJWs aiJWs
         */
        onConnecting(aiJWs : AiJ.AiJWs);

        /**
         * 创建连接事件
         *
         * @param {AiJ.AiJWs} aiJWs             aiJWs
         * @param {number} reconnectAttempts reconnectAttempts
         * @param {Object} event             event
         */
        onOpen(aiJWs : AiJ.AiJWs, reconnectAttempts : number, event : Object);

        /**
         * 断开连接事件
         *
         * @param {AiJ.AiJWs} aiJWs aiJWs
         * @param {Object} event event
         */
        onClose(aiJWs : AiJ.AiJWs, event : Object);

        /**
         * 主动强制关闭事件，不会重连
         *
         * @param {AiJ.AiJWs} aiJWs aiJWs
         * @param {CloseEvent} event event
         */
        onForcedClose(aiJWs : AiJ.AiJWs, event : CloseEvent);

        /**
         * 错误事件
         *
         * @param {AiJ.AiJWs} aiJWs aiJWs
         * @param {Event} event event
         */
        onError(aiJWs : AiJ.AiJWs, event : Event);

        /**
         * 消息事件
         *
         * @param {AiJ.AiJWs} aiJWs        aiJWs
         * @param {MessageEvent} messageEvent messageEvent
         */
        onMessage(aiJWs : AiJ.AiJWs, messageEvent : MessageEvent);

        /**
         * 超时事件
         *
         * @param {AiJ.AiJWs} aiJWs aiJWs
         */
        onTimeout(aiJWs : AiJ.AiJWs);

        /**
         * 连接重试事件
         *
         * @param {AiJ.AiJWs} aiJWs             aiJWs
         * @param {number} reconnectAttempts reconnectAttempts
         */
        onReconnectAttempt(aiJWs : AiJ.AiJWs, reconnectAttempts : number);

        /**
         * 重连失败
         *
         * @param {AiJ.AiJWs} aiJWs             aiJWs
         * @param {number} reconnectAttempts reconnectAttempts
         */
        onReconnectFail(aiJWs : AiJ.AiJWs, reconnectAttempts : number);
    }

    /**
     * 响应处理Handler
     * @class
     */
    export abstract class ResponseHandler {
        /**
         * 处理逻辑
         *
         * @param {AiJ.AiJWs} aiJWs    aiJWs
         * @param {AiJ.Response} response response
         */
        public abstract handler(aiJWs : AiJ.AiJWs, response : AiJ.Response);

        constructor() {
        }
    }
    ResponseHandler["__class"] = "AiJ.ResponseHandler";


    /**
     * Ws 配置
     * @class
     */
    export class Options {
        /**
         * 连接超时时间
         */
        connectionTimeout : number = 10 * 1000;

        /**
         * 重连间隔
         */
        reconnectInterval : number = 1000;

        /**
         * 重连decay
         */
        reconnectDecay : number = 1.1;

        /**
         * 最大重连间隔
         */
        maxReconnectInterval : number = 30 * 1000;

        /**
         * 最大重试次数
         */
        maxRetries : number = 10;

        /**
         * 调试模式
         */
        debug : boolean = true;

        /**
         * 允许重连
         */
        allowReconnect : boolean = true;

        /**
         * 自动打开
         */
        automaticOpen : boolean = true;

        constructor() {
        }
    }
    Options["__class"] = "AiJ.Options";


    /**
     * 初始化配置
     *
     * @param {string} ws     ws
     * @param {Object} object object
     * @class
     */
    export class Config {
        /**
         * WebSocket URL
         */
        ws : string;

        /**
         * 响应路由
         */
        mapping : Object = <Object>new Object();

        /**
         * 配置
         */
        options : AiJ.Options = new AiJ.Options();

        /**
         * 事件监听
         */
        wsEventListener : AiJ.WsEventListener = new Config.Config$0(this);

        public constructor(ws : string, object : Object) {
            if(this.ws===undefined) this.ws = null;
            this.ws = ws;
            this.options.connectionTimeout = object["connectionTimeout"] != null?<any>(object["connectionTimeout"]):this.options.connectionTimeout;
            this.options.maxRetries = object["maxRetries"] != null?<any>(object["maxRetries"]):this.options.maxRetries;
            this.options.debug = object["debug"] != null?<any>(object["debug"]):this.options.debug;
            this.options.allowReconnect = object["allowReconnect"] != null?<any>(object["allowReconnect"]):this.options.allowReconnect;
            this.options.automaticOpen = object["automaticOpen"] != null?<any>(object["automaticOpen"]):this.options.automaticOpen;
            this.options.maxReconnectInterval = object["maxReconnectInterval"] != null?<any>(object["maxReconnectInterval"]):this.options.maxReconnectInterval;
            this.options.reconnectInterval = object["reconnectInterval"] != null?<any>(object["reconnectInterval"]):this.options.reconnectInterval;
            this.options.reconnectDecay = object["reconnectDecay"] != null?<any>(object["reconnectDecay"]):this.options.reconnectDecay;
        }

        /**
         * 设置时间监听
         *
         * @param {*} wsEventListener wsEventListener
         */
        public setWsEventListener(wsEventListener : AiJ.WsEventListener) {
            this.wsEventListener = wsEventListener;
        }

        /**
         * 添加路由
         *
         * @param {number} mainType mainType
         * @param {number} subType  subType
         * @param {AiJ.ResponseHandler} handler  handler
         */
        public addRouter(mainType : number, subType : number, handler : AiJ.ResponseHandler) {
            let mainRouter : Object = <any>(this.mapping[/* valueOf */new String(mainType).toString()]);
            if(mainRouter == null) {
                mainRouter = <Object>new Object();
                this.mapping[/* valueOf */new String(mainType).toString()] = mainRouter;
            }
            let subRouter : Array<AiJ.ResponseHandler> = <any>(mainRouter[/* valueOf */new String(subType).toString()]);
            if(subRouter == null) {
                subRouter = <any>([]);
                mainRouter[/* valueOf */new String(subType).toString()] = subRouter;
            }
            /* add */(subRouter.push(handler)>0);
        }
    }
    Config["__class"] = "AiJ.Config";


    export namespace Config {

        export class Config$0 implements AiJ.WsEventListener {
            public __parent: any;
            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             */
            public onConnecting(aiJWs : AiJ.AiJWs) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onConnecting");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             * @param {number} reconnectAttempts
             * @param {Object} event
             */
            public onOpen(aiJWs : AiJ.AiJWs, reconnectAttempts : number, event : Object) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onOpen");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             * @param {Object} event
             */
            public onClose(aiJWs : AiJ.AiJWs, event : Object) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onClose");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             * @param {CloseEvent} event
             */
            public onForcedClose(aiJWs : AiJ.AiJWs, event : CloseEvent) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onForcedClose");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             * @param {Event} event
             */
            public onError(aiJWs : AiJ.AiJWs, event : Event) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onError");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             * @param {MessageEvent} messageEvent
             */
            public onMessage(aiJWs : AiJ.AiJWs, messageEvent : MessageEvent) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onMessage");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             */
            public onTimeout(aiJWs : AiJ.AiJWs) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onTimeout");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             * @param {number} reconnectAttempts
             */
            public onReconnectAttempt(aiJWs : AiJ.AiJWs, reconnectAttempts : number) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onReconnectAttempt");
                }
            }

            /**
             *
             * @param {AiJ.AiJWs} aiJWs
             * @param {number} reconnectAttempts
             */
            public onReconnectFail(aiJWs : AiJ.AiJWs, reconnectAttempts : number) {
                if(aiJWs.config.options.debug) {
                    window.console.log("onReconnectFail");
                }
            }

            constructor(__parent: any) {
                this.__parent = __parent;
            }
        }
        Config$0["__interfaces"] = ["AiJ.WsEventListener"];


    }


    export class AiJWs {
        /**
         * self
         */
        self : AiJ.AiJWs;

        /**
         * Ws
         */
        ws : WebSocket;

        /**
         * 配置
         */
        config : AiJ.Config;

        /**
         * 重连次数
         */
        reconnectAttempts : number = 0;

        /**
         * 连接状态
         */
        readyState : number = -1;

        /**
         * 主动关闭
         */
        forcedClose : boolean = false;

        /**
         * 超时
         */
        timedOut : boolean = false;

        constructor(config : AiJ.Config) {
            if(this.self===undefined) this.self = null;
            if(this.ws===undefined) this.ws = null;
            if(this.config===undefined) this.config = null;
            this.self = this;
            this.config = config;
            if(this.config.options.automaticOpen) {
                this.connect(false);
            }
        }

        public reconnect() {
            this.reconnectAttempts++;
            if(this.reconnectAttempts > this.config.options.maxRetries) {
                this.config.wsEventListener.onReconnectFail(this, this.reconnectAttempts);
                return;
            }
            this.config.wsEventListener.onReconnectAttempt(this, this.reconnectAttempts);
            let timeout : number = this.self.config.options.reconnectInterval * Math.pow(this.self.config.options.reconnectDecay, this.self.reconnectAttempts);
            window.setTimeout((() => this.self.connect(true)), timeout > this.self.config.options.maxReconnectInterval?this.self.config.options.maxReconnectInterval:timeout);
        }

        /**
         * 连接
         *
         * @param {boolean} reconnectAttempt
         *  是否为重连进来的请求 第一次链接为false，后续重连的为true
         */
        public connect(reconnectAttempt : boolean) {
            if(!reconnectAttempt) {
                this.reconnectAttempts = 0; // 重连的次数
            }
            this.ws = new WebSocket(this.config.ws);
            this.forcedClose = false;
            this.readyState = this.ws.CONNECTING;
            this.config.wsEventListener.onConnecting(this.self);
            let timeoutHandle : number = window.setTimeout((() => {
                this.timedOut = true;
                this.config.wsEventListener.onTimeout(this.self);
                this.ws.close();
                this.timedOut = false;
            }), this.config.options.connectionTimeout);
            this.ws.onopen = (event : Event) => {
                window.clearTimeout(timeoutHandle);
                this.self.readyState = this.ws.OPEN;
                this.self.reconnectAttempts = 0;
                this.config.wsEventListener.onOpen(this.self, this.self.reconnectAttempts, event);
                return <Object>new Object();
            };
            this.ws.onclose = (closeEvent : CloseEvent) => {
                window.clearTimeout(timeoutHandle);
                if(this.forcedClose) {
                    this.self.readyState = this.ws.CLOSED;
                    this.config.wsEventListener.onForcedClose(this.self, closeEvent);
                } else {
                    if(!reconnectAttempt && !this.timedOut) {
                        this.config.wsEventListener.onClose(this.self, closeEvent);
                    }
                    this.reconnect();
                }
                return <Object>new Object();
            };
            this.ws.onerror = (event : Event) => {
                window.clearTimeout(timeoutHandle);
                this.config.wsEventListener.onError(this.self, event);
                return <Object>new Object();
            };
            this.ws.onmessage = (messageEvent : MessageEvent) => {
                if(this.config.options.debug) {
                    window.console.log("\u63a5\u6536\u4fe1\u606f:" + JSON.stringify(messageEvent.data));
                }
                try {
                    let response : AiJ.Response = <AiJ.Response>JSON.parse(<string>messageEvent.data);
                    if(response != null) {
                        response.text = <string>messageEvent.data;
                        let mainTypeMapping : Object = <any>(this.config.mapping[/* valueOf */new String(response.mainType).toString()]);
                        if(mainTypeMapping != null) {
                            let functions : Array<AiJ.ResponseHandler> = <any>(mainTypeMapping[/* valueOf */new String(response.subType).toString()]);
                            if(functions != null) {
                                for(let i : number = 0; i < /* size */(<number>functions.length); i++) {
                                    /* get */functions[i].handler(this.self, response);
                                };
                            } else {
                                if(this.config.options.debug) {
                                    window.console.log("mainType:" + response.mainType + " subType:" + response.subType + " no mapping");
                                }
                            }
                        } else {
                            if(this.config.options.debug) {
                                window.console.log("mainType:" + response.mainType + " no mapping");
                            }
                        }
                    }
                } finally {
                    this.config.wsEventListener.onMessage(this.self, messageEvent);
                };
                return <Object>new Object();
            };
        }

        /**
         * 发送数据
         *
         * @param {AiJ.AiJEvent} event event
         */
        send(event : AiJ.AiJEvent) {
            if(this.config.options.debug) {
                window.console.log("\u53d1\u9001\u4fe1\u606f:" + JSON.stringify(event));
            }
            this.ws.send(JSON.stringify(event));
        }

        /**
         * 关闭链接
         */
        close() {
            this.forcedClose = true;
            this.ws.close();
        }
    }
    AiJWs["__class"] = "AiJ.AiJWs";

}



