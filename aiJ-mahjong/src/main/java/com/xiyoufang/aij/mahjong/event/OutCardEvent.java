package com.xiyoufang.aij.mahjong.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class OutCardEvent extends Event {

    /**
     * 牌
     */
    private byte card;

    public byte getCard() {
        return card;
    }

    public void setCard(byte card) {
        this.card = card;
    }
}
