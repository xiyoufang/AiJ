import {AiJ} from "../../ws/AiJ";
import AlertWindow from "../../AlertWindow";

export default class PlazaCommonResponseHandler extends AiJ.ResponseHandler {

    constructor() {
        super();
    }

    handler(aiJWs: AiJ.AiJWs, response: AiJ.Response) {
        AlertWindow.alert("提示信息", response.message);
    }

}
