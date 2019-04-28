package com.xiyoufang.aij.room.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2018-12-21.
 * 聊天事件
 *
 * @author 席有芳
 */
public class ChatEvent extends Event {

    /**
     * 内容
     */
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
