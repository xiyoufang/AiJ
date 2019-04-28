package com.xiyoufang.aij.mahjong.response;

/**
 * Created by 席有芳 on 2019-01-26.
 *
 * @author 席有芳
 */
public class WeaveItemResponse {

    /**
     * 组合类型
     */
    private int weaveType;
    /**
     * 中间的牌
     */
    private byte centerCard;
    /**
     * 是否公开（用来区分暗杠）
     */
    private boolean open;
    /**
     * 供应的玩家Chair
     */
    private int provider;

    public int getWeaveType() {
        return weaveType;
    }

    public void setWeaveType(int weaveType) {
        this.weaveType = weaveType;
    }

    public byte getCenterCard() {
        return centerCard;
    }

    public void setCenterCard(byte centerCard) {
        this.centerCard = centerCard;
    }

    public boolean isOpen() {
        return open;
    }

    public void setOpen(boolean open) {
        this.open = open;
    }

    public int getProvider() {
        return provider;
    }

    public void setProvider(int provider) {
        this.provider = provider;
    }
}
