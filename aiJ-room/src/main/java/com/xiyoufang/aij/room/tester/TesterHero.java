package com.xiyoufang.aij.room.tester;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.room.table.Table;

/**
 * Created by 席有芳 on 2018-12-24.
 *
 * @author 席有芳
 */
public class TesterHero {
    /**
     * 号码
     */
    private String mobile;
    /**
     * 密码
     */
    private String password;
    /**
     * 展示用的ID
     */
    private String showId;
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 用户Name
     */
    private String userName;
    /**
     * Web Socket
     */
    private WebSocket webSocket;
    /**
     * 初始化为无效的椅子
     */
    private int chair = Table.INVALID_CHAIR;

    public String getShowId() {
        return showId;
    }

    public void setShowId(String showId) {
        this.showId = showId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public WebSocket getWebSocket() {
        return webSocket;
    }

    void setWebSocket(WebSocket webSocket) {
        this.webSocket = webSocket;
    }

    public int getChair() {
        return chair;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getMobile() {
        return mobile;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword() {
        return password;
    }
}
