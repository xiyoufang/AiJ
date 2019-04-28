package com.xiyoufang.aij.plaza.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-02-27.
 * 资产赠送事件
 *
 * @author 席有芳
 */
public class UserAssetTransEvent extends Event {
    /**
     * 资产Code
     */
    private String assetCode;
    /**
     * 买方用户ID
     */
    private String buyerId;
    /**
     * 数量
     */
    private int quantity;

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }

    public String getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(String buyerId) {
        this.buyerId = buyerId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
