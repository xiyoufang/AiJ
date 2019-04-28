package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class OutCardEventResponse extends CommonResponse {
    /**
     * 出的牌
     */
    private byte card;
    /**
     * 椅子
     */
    private int chair;

    public byte getCard() {
        return card;
    }

    public void setCard(byte card) {
        this.card = card;
    }

    public int getChair() {
        return chair;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }
}
