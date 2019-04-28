package com.xiyoufang.aij.plaza.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2019-02-27.
 *
 * @author 席有芳
 */
public class UserAssetTransEventResponse extends CommonResponse {
    /**
     * 是否成功
     */
    private boolean success;
    /**
     * 剩余数量
     */
    private int quantity;
    /**
     * 提示信息
     */
    private String tips;
    /**
     * 资产Code
     */
    private String assetCode;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getTips() {
        return tips;
    }

    public void setTips(String tips) {
        this.tips = tips;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }
}
