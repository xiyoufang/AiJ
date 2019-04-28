import {AiJ} from "../../ws/AiJ";

/**
 * 玩家离开
 */
export default class HeroLeaveEventResponse extends AiJ.Response {
    /**
     * 椅子
     */
    chair: number;
    /**
     * 用户ID
     */
    userId: string;
    /**
     * 用户名
     */
    userName: string;
}
