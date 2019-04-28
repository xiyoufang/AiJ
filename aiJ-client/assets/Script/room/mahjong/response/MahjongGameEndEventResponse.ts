import {AiJ} from "../../../ws/AiJ";
import MahjongWeaveItem from "../struct/MahjongWeaveItem";

export default class MahjongGameEndEventResponse extends AiJ.Response {

    /**
     * 椅子总数
     */
    chairCount: number;
    /**
     * 庄
     */
    banker: number;
    /**
     * 组合
     */
    weaveItems: Array<Array<MahjongWeaveItem>>;
    /**
     * 全部的牌
     */
    cards: Array<Array<number>>;
    /**
     * 胡牌者
     */
    chairs: Array<number>;
    /**
     * 供应者
     */
    provider: number;
    /**
     * 分数
     */
    scores: number;
    /**
     * 总分数
     */
    totalScores: number;
    /**
     * 当前牌
     */
    currCard: number;
    /**
     * 信息
     */
    infos: number;
}
