import {AiJ} from "../../ws/AiJ";

/**
 * 大厅登录
 */
export default class PlazaLoginEventResponse extends AiJ.Response {

    /**
     * 玩家名称
     */
    userName: string;
    /**
     *  Show ID
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
