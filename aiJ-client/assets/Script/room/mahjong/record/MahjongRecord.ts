import MahjongPlayerRecord from "./MahjongPlayerRecord";
import MahjongGameRecord from "./MahjongGameRecord";

export default class MahjongRecord {

    /**
     * 玩家
     */
    mahjongPlayerRecords: Array<MahjongPlayerRecord>;
    /**
     * 游戏
     */
    mahjongGameRecords: Array<MahjongGameRecord>;
    /**
     * 总分数
     */
    totalScores: Array<number>;
    /**
     * 桌子编号
     */
    tableNo: number;

}
