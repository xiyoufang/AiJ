import {AiJ} from "../../../ws/AiJ";

export default class MahjongGameStartEventResponse extends AiJ.Response {
    /**
     * 椅子总数
     */
    chairCount: number;
    /**
     * 椅子
     */
    chair: number;
    /**
     * 筛子
     */
    diceSum: number;
    /**
     * 筛子
     */
    banker: number;
    /**
     * 当前玩家
     */
    current: number;
    /**
     * 剩余的牌
     */
    leftCardCount: number;
    /**
     * 牌
     */
    cards: Array<number>;
    /**
     * 总局数
     */
    totalNumber: number;
    /**
     * 当前局数
     */
    currentNumber: number;
    /**
     * 分数
     */
    scores: Array<number>;

}
