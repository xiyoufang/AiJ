package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class OperateNotifyEventResponse extends CommonResponse {
    /**
     * 动作
     */
    private int action;
    /**
     * 被通知人
     */
    private int chair;
    /**
     * 供应人
     */
    private int provider;
    /**
     * 对应的牌
     */
    private byte card;
    /**
     * 杠的牌
     */
    private byte[] cards;

    public int getProvider() {
        return provider;
    }

    public void setProvider(int provider) {
        this.provider = provider;
    }

    public int getAction() {
        return action;
    }

    public void setAction(int action) {
        this.action = action;
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

    public byte[] getCards() {
        return cards;
    }

    public void setCards(byte[] cards) {
        this.cards = cards;
    }
}
