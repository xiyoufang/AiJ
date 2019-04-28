import {AiJ} from "../../../ws/AiJ";
import MahjongWeaveItem from "../struct/MahjongWeaveItem";

export default class MahjongPlayingGameSceneResponse extends AiJ.Response {
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
     * 当前的牌
     */
    currCard: number;
    /**
     * 动作
     */
    action: number;
    /**
     * 动作的牌
     */
    actionCard: number;
    /**
     * 动作的牌
     */
    actionCards: Array<number>;
    /**
     * 组合
     */
    weaveItems: Array<Array<MahjongWeaveItem>>;
    /**
     * 出牌总数
     */
    discardCount: Array<number>;
    /**
     * 出牌的记录
     */
    discardCards: Array<Array<number>>;
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
