package com.xiyoufang.aij.event;

/**
 * Created by 席有芳 on 2018-12-19.
 * 通过邮箱登录
 *
 * @author 席有芳
 */
public class EmailLoginEvent extends Event {

    /**
     * 用户名
     */
    private String email;
    /**
     * 用户密码
     */
    private String password;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
