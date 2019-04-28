package com.xiyoufang.aij.plaza.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2018-12-27.
 * 获取房间列表事件
 *
 * @author 席有芳
 */
public class RoomTypeEvent extends Event {
    /**
     * 类型名称
     */
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
