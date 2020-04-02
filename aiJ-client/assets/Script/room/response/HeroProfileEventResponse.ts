import {AiJ} from "../../ws/AiJ";

/**
 * 玩家信息
 */
export default class HeroProfileEventResponse extends AiJ.Response {
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
    /**
     * 代理
     */
    distributorId: string;
    /**
     * 地址
     */
    address: string;
    /**
     * 经度
     */
    longitude: number;
    /**
     * 纬度
     */
    latitude: number;
    /**
     * ip
     */
    ip: string;
    /**
     * 实名状态
     */
    certStatus: string;
}
