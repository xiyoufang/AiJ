import {AiJ} from "../../ws/AiJ";
import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";

/**
 * 玩家信息
 */
export default class HeroProfileEventResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.GAME_FIRE).fire("hero_profile", response);
    }

}
