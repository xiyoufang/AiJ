package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-24.
 *
 * @author 席有芳
 */
public class OperateResultEventResponse extends CommonResponse {
    /**
     * 操作人
     */
    private int chair;
    /**
     * 供应人
     */
    private int provider;
    /**
     * 动作
     */
    private int action;
    /**
     * 牌
     */
    private byte card;

    public int getChair() {
        return chair;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }

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

    public byte getCard() {
        return card;
    }

    public void setCard(byte card) {
        this.card = card;
    }
}
