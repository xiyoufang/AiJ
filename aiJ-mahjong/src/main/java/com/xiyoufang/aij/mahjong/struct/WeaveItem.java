package com.xiyoufang.aij.mahjong.struct;

/**
 * Created by 席有芳 on 2018/1/21.
 * 面牌组合（碰、杠、吃）
 *
 * @author 席有芳
 */
public class WeaveItem {
    /**
     * 组合类型
     */
    private WeaveType weaveType;
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
    /**
     * 有效标识（用来标识区分抢杠）
     */
    private boolean valid;

    public WeaveItem() {
    }

    public WeaveItem(WeaveType weaveType, byte centerCard, boolean open, Integer provider, boolean valid) {
        this.weaveType = weaveType;
        this.centerCard = centerCard;
        this.open = open;
        this.provider = provider;
        this.valid = valid;
    }

    public WeaveType getWeaveType() {
        return weaveType;
    }

    public void setWeaveType(WeaveType weaveType) {
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

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }
}
