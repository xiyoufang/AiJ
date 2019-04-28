import {AiJ} from "../../ws/AiJ";
import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";

/**
 * 同桌子玩家离线
 */
export default class HeroOfflineEventResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.GAME_FIRE).fire("hero_offline", response);
    }

}
