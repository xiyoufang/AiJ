package com.xiyoufang.aij.room.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-01-24.
 * 获取玩家信息的接口
 *
 * @author 席有芳
 */
public class HeroProfileEvent extends Event {

    /**
     * 玩家ID
     */
    private String userId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
