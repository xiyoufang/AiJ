import {AiJ} from "../../ws/AiJ";
import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";

export default class RechargeRecordEventResponseHandler extends AiJ.ResponseHandler {

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        FireKit.use(AppConfig.PLAZA_FIRE).fire("recharge_record", response);
    }

}
