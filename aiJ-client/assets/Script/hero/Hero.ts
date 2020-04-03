/**
 * 玩家类
 */
import AppConfig from "../AppConfig";

export default class Hero {

    /**
     * 玩家名称
     */
    userName: string;
    /**
     * show ID
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
     * Ip地址
     */
    ip: string;
    /**
     * 实名认证
     */
    certStatus: string;

    /**
     *
     * @param userName
     * @param showId
     * @param userId
     * @param nickName
     * @param gender
     * @param avatar
     * @param distributorId
     * @param address
     * @param longitude
     * @param latitude
     * @param ip
     * @param certStatus
     */
    constructor(userName: string, showId: string, userId: string, nickName: string, gender: number, avatar: string, distributorId: string,
                address: string, longitude: number, latitude: number, ip: string, certStatus: string) {
        this.userName = userName;
        this.showId = showId;
        this.userId = userId;
        this.nickName = nickName;
        this.gender = gender;
        this.avatar = cc.sys.isBrowser ? AppConfig.AVATAR_PROXY_URL + "?url=" + encodeURIComponent(avatar) : avatar;
        this.distributorId = distributorId;
        this.address = address;
        this.longitude = longitude;
        this.latitude = latitude;
        this.ip = ip;
        this.certStatus = certStatus;
    }
}
