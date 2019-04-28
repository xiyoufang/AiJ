package com.xiyoufang.aij.room.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class ChatEventResponse extends CommonResponse {
    /**
     * 内容
     */
    private String content;
    /**
     * 位置
     */
    private int chair;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getChair() {
        return chair;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }
}
