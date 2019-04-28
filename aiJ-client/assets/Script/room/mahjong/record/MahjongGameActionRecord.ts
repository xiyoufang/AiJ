import {MahjongAction} from "./MahjongAction";

export default class MahjongGameActionRecord {
    /**
     * 动作
     */
    mahjongAction: MahjongAction;
    /**
     * 椅子
     */
    chair: number;
    /**
     * 供应者
     */
    provider: number;
    /**
     * 牌
     */
    card: number;
    /**
     * 多张牌
     */
    cards: Array<number>;
    /**
     * 操作
     */
    action: number;
}
