import {AiJ} from "../../../ws/AiJ";
import FireKit from "../../../fire/FireKit";
import AppConfig from "../../../AppConfig";

/**
 * 游戏结束Handler
 */
export default class MahjongEndEventResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    /**
     * 结束
     * @param aiJWs
     * @param response
     */
    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.GAME_FIRE).fire("end", response);
    }

}
