package com.xiyoufang.aij.room.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public class LoginNotifyResponse extends CommonResponse {

    /**
     * 用户名称
     */
    private String userName;

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
