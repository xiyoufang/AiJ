import {AiJ} from "../../ws/AiJ";
import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";

/**
 * 同桌子玩家坐下
 */
export default class HeroSitDownEventResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.GAME_FIRE).fire("hero_sitDown", response);
    }

}
