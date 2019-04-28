import {AiJ} from "../../ws/AiJ";
import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";

export default class RoomRecordEventResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.PLAZA_FIRE).fire("room_record", response);
    }

}
