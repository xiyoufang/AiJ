package com.xiyoufang.aij.mahjong.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2018-12-23.
 * 操作事件
 *
 * @author 席有芳
 */
public class OperateEvent extends Event {
    /**
     * 动作
     */
    private int action;
    /**
     * 操作的牌
     */
    private byte card;

    public int getAction() {
        return action;
    }

    public void setAction(int action) {
        this.action = action;
    }

    public byte getCard() {
        return card;
    }

    public void setCard(byte card) {
        this.card = card;
    }
}
