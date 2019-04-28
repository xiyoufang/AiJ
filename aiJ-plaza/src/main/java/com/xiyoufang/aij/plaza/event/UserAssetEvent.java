package com.xiyoufang.aij.plaza.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-02-22.
 * 读取用户资产事件
 *
 * @author 席有芳
 */
public class UserAssetEvent extends Event {
    /**
     * 资产Code
     */
    private String[] assetCodes = {};

    public String[] getAssetCodes() {
        return assetCodes;
    }

    public void setAssetCodes(String[] assetCodes) {
        this.assetCodes = assetCodes;
    }
}
