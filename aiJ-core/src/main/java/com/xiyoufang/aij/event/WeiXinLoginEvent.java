package com.xiyoufang.aij.event;

/**
 * Created by 席有芳 on 2019-07-25.
 *
 * @author 席有芳
 */
public class WeiXinLoginEvent extends Event {
    /**
     * 微信Code
     */
    private String code;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
