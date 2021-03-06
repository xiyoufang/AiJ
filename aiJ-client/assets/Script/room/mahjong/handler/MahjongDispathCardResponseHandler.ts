import {AiJ} from "../../../ws/AiJ";
import FireKit from "../../../fire/FireKit";
import AppConfig from "../../../AppConfig";

/**
 * 发牌
 */
export default class MahjongGameStartResponseHandler extends AiJ.ResponseHandler {

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.GAME_FIRE).fire("dispatch_card", response);
    }

}
