import {AiJ} from "../../../ws/AiJ";

/**
 * 操作事件
 */
export default class MahjongOperateEvent extends AiJ.AiJEvent {
    /**
     * 动作
     */
    action: number;
    /**
     * 牌
     */
    card: number;

    constructor(action: number, card: number) {
        super();
        this.action = action;
        this.card = card;
        this.mainType = 8;
        this.subType = 1;
    }
}
