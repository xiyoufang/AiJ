import {AiJ} from "../../ws/AiJ";
import AlertWindow from "../../AlertWindow";
import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";

export default class BroadcastEventResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.PLAZA_FIRE).emit("broadcast", response);
    }

}
