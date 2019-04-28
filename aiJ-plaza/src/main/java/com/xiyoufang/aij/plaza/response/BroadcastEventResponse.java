package com.xiyoufang.aij.plaza.response;

import com.xiyoufang.aij.response.CommonResponse;

import java.util.List;

/**
 * Created by 席有芳 on 2019-02-19.
 * 广播
 *
 * @author 席有芳
 */
public class BroadcastEventResponse extends CommonResponse {
    /**
     * 广播信息列表
     */
    private List<String> broadcasts;

    public List<String> getBroadcasts() {
        return broadcasts;
    }

    public void setBroadcasts(List<String> broadcasts) {
        this.broadcasts = broadcasts;
    }
}
