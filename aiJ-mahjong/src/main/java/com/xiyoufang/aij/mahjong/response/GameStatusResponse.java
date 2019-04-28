package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * 当前游戏状态
 * Created by 席有芳 on 2019-01-20.
 *
 * @author 席有芳
 */
public class GameStatusResponse extends CommonResponse {

    private int status;

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}
