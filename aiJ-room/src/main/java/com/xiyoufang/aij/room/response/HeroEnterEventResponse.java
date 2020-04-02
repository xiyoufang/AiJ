package com.xiyoufang.aij.room.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class HeroEnterEventResponse extends CommonResponse {
    /**
     * 椅子
     */
    private int chair;
    /**
     * 展示用的ID
     */
    private String showId;
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 用户名
     */
    private String nickName;

    public int getChair() {
        return chair;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }

    public String getShowId() {
        return showId;
    }

    public void setShowId(String showId) {
        this.showId = showId;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
