package com.xiyoufang.aij.plaza.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-07-25.
 * 微信授权事件
 *
 * @author 席有芳
 */
public class WeiXinAuthEvent extends Event {
    /**
     * 微信返回的Code
     */
    private String code;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
