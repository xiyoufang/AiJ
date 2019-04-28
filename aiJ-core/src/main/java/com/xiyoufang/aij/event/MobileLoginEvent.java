package com.xiyoufang.aij.event;

/**
 * Created by 席有芳 on 2018-12-19.
 *  通过手机号码登录
 * @author 席有芳
 */
public class MobileLoginEvent extends Event {

    /**
     * 用户名
     */
    private String mobile;
    /**
     * 用户密码
     */
    private String password;

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
