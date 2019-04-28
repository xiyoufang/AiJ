package com.xiyoufang.aij.mahjong.record;

import java.util.List;

/**
 * Created by 席有芳 on 2019-01-28.
 * 玩家记录
 *
 * @author 席有芳
 */
public class MahjongPlayerRecord {

    /**
     * 玩家名称
     */
    private String userName;
    /**
     * 玩家唯一ID
     */
    private String userId;
    /**
     * 昵称
     */
    private String nickName;
    /**
     * 性别
     */
    private Integer gender;
    /**
     * 头像
     */
    private String avatar;
    /**
     * 经度
     */
    private Double longitude;
    /**
     * 纬度
     */
    private Double latitude;
    /**
     * 地址
     */
    private String address;
    /**
     * ip
     */
    private String ip;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public Integer getGender() {
        return gender;
    }

    public void setGender(Integer gender) {
        this.gender = gender;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }
}
