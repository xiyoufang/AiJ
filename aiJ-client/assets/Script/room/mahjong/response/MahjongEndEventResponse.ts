import {AiJ} from "../../../ws/AiJ";

/**
 * 麻将结束响应
 */
export default class MahjongEndEventResponse extends AiJ.Response {
    /**
     * 开始时间
     */
    startedTime: number;
    /**
     * 结束时间
     */
    endedTime: number;
    /**
     * 房号
     */
    tableNo: number;
    /**
     * 分数
     */
    score: Array<number>;
    /**
     * 统计
     */
    actionStatistics: Array<Array<number>>;

}
