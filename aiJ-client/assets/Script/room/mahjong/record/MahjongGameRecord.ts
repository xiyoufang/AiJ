import MahjongGameStartRecord from "./MahjongGameStartRecord";
import MahjongGameActionRecord from "./MahjongGameActionRecord";

export default class MahjongGameRecord {

    /**
     * 开始的记录
     */
    mahjongGameStartRecord: Array<MahjongGameStartRecord>;
    /**
     * 动作的记录
     */
    mahjongGameActionRecords: Array<MahjongGameActionRecord>;
    /**
     * 原始牌
     */
    repertory: Array<number>;
    /**
     * 单局的分数
     */
    scores: Array<number>;
    /**
     * 庄
     */
    banker: Array<number>;

}
