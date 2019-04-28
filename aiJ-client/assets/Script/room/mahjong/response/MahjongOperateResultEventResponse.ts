import {AiJ} from "../../../ws/AiJ";

export default class MahjongOperateResultEventResponse extends AiJ.Response {

    /**
     * 操作人
     */
    chair: number;
    /**
     * 供应人
     */
    provider: number;
    /**
     * 动作
     */
    action: number;
    /**
     * 牌
     */
    card: number;
    
}
