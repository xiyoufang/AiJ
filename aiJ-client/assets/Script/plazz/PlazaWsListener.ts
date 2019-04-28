import {AiJ} from "../ws/AiJ";
import FireKit from "../fire/FireKit";
import AppConfig from "../AppConfig";
import LoadingWindow from "../LoadingWindow";

/**
 * 大厅网络事件监听
 */
export default class PlazaWsListener implements AiJ.WsEventListener {

    onClose(aiJWs: AiJ.AiJWs, event: Object) {
        console.log("websocket close");
        LoadingWindow.close();
    }

    onConnecting(aiJWs: AiJ.AiJWs) {
        LoadingWindow.loading("正在连接服务器!");
    }

    onError(aiJWs: AiJ.AiJWs, event: Event) {

    }

    onForcedClose(aiJWs: AiJ.AiJWs, event: CloseEvent) {
        LoadingWindow.close();
    }

    onMessage(aiJWs: AiJ.AiJWs, messageEvent: MessageEvent) {

    }

    onOpen(aiJWs: AiJ.AiJWs, reconnectAttempts: number, event: Object) {
        LoadingWindow.close();
        FireKit.use(AppConfig.LOCAL_FIRE).fire("login");
    }

    onReconnectAttempt(aiJWs: AiJ.AiJWs, reconnectAttempts: number) {
        LoadingWindow.loading("网络连接异常，重新连接中...\n" +
            "第" + reconnectAttempts + "次重试");

    }

    onReconnectFail(aiJWs: AiJ.AiJWs, reconnectAttempts: number) {
        LoadingWindow.close();
        FireKit.use(AppConfig.PLAZA_FIRE).emit("ws_error");
    }

    onTimeout(aiJWs: AiJ.AiJWs) {

    }

}
