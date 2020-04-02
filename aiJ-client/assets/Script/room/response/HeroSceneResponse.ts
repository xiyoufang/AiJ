import {AiJ} from "../../ws/AiJ";

/**
 * 玩家
 */
export default class HeroSceneResponse extends AiJ.Response {
    /**
     * 玩家列表
     */
    heroes: Array<HeroItem>;

}

export class HeroItem {
    /**
     *  椅子
     */
    chair: number;
    /**
     * 显示ID
     */
    showId: string;
    /**
     * 玩家ID
     */
    userId: string;
    /**
     * 昵称
     */
    nickName: string;
    /**
     * 在线状态
     */
    online: boolean;
    /**
     * 坐下状态
     */
    sitDown: boolean;

}
