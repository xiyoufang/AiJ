package com.xiyoufang.aij.mahjong.record;

/**
 * Created by 席有芳 on 2019-01-28.
 *
 * @author 席有芳
 */
public class MahjongGameActionRecord {

    /**
     * 动作
     */
    private MahjongAction mahjongAction;
    /**
     * 椅子
     */
    private int chair;
    /**
     * 供应者
     */
    private int provider;
    /**
     * 牌
     */
    private byte card;
    /**
     * 多张牌
     */
    private byte[] cards;
    /**
     * 操作
     */
    private int action;

    public MahjongAction getMahjongAction() {
        return mahjongAction;
    }

    public void setMahjongAction(MahjongAction mahjongAction) {
        this.mahjongAction = mahjongAction;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }

    public int getChair() {
        return chair;
    }

    public void setProvider(int provider) {
        this.provider = provider;
    }

    public int getProvider() {
        return provider;
    }

    public void setCard(byte card) {
        this.card = card;
    }

    public byte getCard() {
        return card;
    }

    public byte[] getCards() {
        return cards;
    }

    public void setCards(byte[] cards) {
        this.cards = cards;
    }

    public void setAction(int action) {
        this.action = action;
    }

    public int getAction() {
        return action;
    }
}
