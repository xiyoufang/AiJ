package com.xiyoufang.aij.plaza.response;

import com.xiyoufang.aij.response.Response;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2019-02-22.
 * 用户资产事件响应
 *
 * @author 席有芳
 */
public class UserAssetEventResponse extends Response {
    /**
     * 资产数量
     */
    private Map<String, Integer> assetsQuantity = new HashMap<>();

    public Map<String, Integer> getAssetsQuantity() {
        return assetsQuantity;
    }

    public void setAssetsQuantity(Map<String, Integer> assetsQuantity) {
        this.assetsQuantity = assetsQuantity;
    }
}
