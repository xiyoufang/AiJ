import {AiJ} from "../../ws/AiJ";

export default class BroadcastEventResponse extends AiJ.Response {

    /**
     * 广播内容
     */
    broadcasts: Array<string> = [];

}
