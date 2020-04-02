import {AiJ} from "../../ws/AiJ";

/**
 * 登录成功事件
 */
export default class RoomLoginEventResponse extends AiJ.Response {

    /**
     * 玩家名称
     */
    userName: string;
    /**
     * 显示ID
     */
    showId: string;
    /**
     * ID
     */
    userId: string;
    /**
     * 昵称
     */
    nickName: string;
    /**
     * 性别
     */
    gender: number;
    /**
     * 头像
     */
    avatar: string;

}
