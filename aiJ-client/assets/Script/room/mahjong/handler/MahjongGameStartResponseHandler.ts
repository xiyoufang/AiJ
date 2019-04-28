import {AiJ} from "../../../ws/AiJ";
import FireKit from "../../../fire/FireKit";
import AppConfig from "../../../AppConfig";

/**
 * 游戏开始响应Handler
 */
export default class MahjongGameStartResponseHandler extends AiJ.ResponseHandler {

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.GAME_FIRE).fire("game_start", response);
    }

}
