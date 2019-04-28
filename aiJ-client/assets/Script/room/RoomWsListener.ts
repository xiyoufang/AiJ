import {AiJ} from "../ws/AiJ";
import FireKit from "../fire/FireKit";
import AppConfig from "../AppConfig";
import LoadingWindow from "../LoadingWindow";


export default class RoomWsListener implements AiJ.WsEventListener {

    onClose(aiJWs: AiJ.AiJWs, event: Object) {
        LoadingWindow.close();
    }

    onConnecting(aiJWs: AiJ.AiJWs) {
        LoadingWindow.loading("正在连接服务器!");
    }

    onError(aiJWs: AiJ.AiJWs, event: Event) {
    }

    onForcedClose(aiJWs: AiJ.AiJWs, event: CloseEvent) {
    }

    onMessage(aiJWs: AiJ.AiJWs, messageEvent: MessageEvent) {
    }

    onOpen(aiJWs: AiJ.AiJWs, reconnectAttempts: number, event: Object) {
        FireKit.use(AppConfig.GAME_FIRE).emit("open");//连接打开事件
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
