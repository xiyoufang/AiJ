import {AiJ} from "../../ws/AiJ";

/**
 * 玩家进入
 */
export default class HeroEnterEventResponse extends AiJ.Response {
    /**
     * 椅子
     */
    chair: number;
    /**
     * 显示ID
     */
    showId: string;
    /**
     * 用户ID
     */
    userId: string;
    /**
     * 昵称
     */
    nickName: string;
}
