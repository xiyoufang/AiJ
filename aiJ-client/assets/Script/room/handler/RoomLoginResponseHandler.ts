import {AiJ} from "../../ws/AiJ";
import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";

/**
 * 登录响应
 */
export default class RoomLoginResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {//登录成功
        FireKit.use(AppConfig.GAME_FIRE).emit("login_success", response)
    }

}
