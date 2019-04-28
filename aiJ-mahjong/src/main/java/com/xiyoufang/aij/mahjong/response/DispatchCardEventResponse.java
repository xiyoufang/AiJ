package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.Response;

/**
 * Created by 席有芳 on 2018-12-22.
 *
 * @author 席有芳
 */
public class DispatchCardEventResponse extends Response {
    /**
     * 椅子
     */
    private int chair;
    /**
     * 牌
     */
    private byte card;
    /**
     * 末尾
     */
    private boolean tail;

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

    public boolean isTail() {
        return tail;
    }

    public void setTail(boolean tail) {
        this.tail = tail;
    }
}
