import {AiJ} from "../../ws/AiJ";

/**
 * 解散投票响应
 */
export default class DismissVoteEventResponse extends AiJ.Response {
    /**
     * 投票状态
     */
    status: number;
    /**
     * 投票时间
     */
    voteTime: string;
    /**
     * 倒计时
     */
    countDown: number;
    /**
     * 同意
     */
    agrees: Array<number>;
    /**
     * 拒绝
     */
    refuses: Array<number>;

}
