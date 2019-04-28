import {AiJ} from "../../../ws/AiJ";

/**
 * 操作通知
 */
export default class MahjongOperateNotifyEventResponse extends AiJ.Response {

    /**
     * 动作
     */
    action: number;
    /**
     * 被通知人
     */
    chair: number;
    /**
     * 供应人
     */
    provider: number;
    /**
     * 对应的牌
     */
    card: number;
    /**
     * 杠的牌
     */
    cards: Array<number>;

}
