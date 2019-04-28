package com.xiyoufang.aij.mahjong.struct;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class P {
    /**
     * 供应者位置
     */
    private int chair;
    /**
     * 牌
     */
    private byte card;

    public P(int chair, byte card) {
        this.chair = chair;
        this.card = card;
    }

    public int getChair() {
        return chair;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }

    public byte getCard() {
        return card;
    }

    public void setCard(byte card) {
        this.card = card;
    }
}
