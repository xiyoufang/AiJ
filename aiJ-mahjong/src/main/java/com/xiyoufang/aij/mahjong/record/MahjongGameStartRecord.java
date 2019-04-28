package com.xiyoufang.aij.mahjong.record;

/**
 * Created by 席有芳 on 2019-01-28.
 *
 * @author 席有芳
 */
public class MahjongGameStartRecord {
    /**
     * 牌
     */
    private byte[] cards;

    public void setCards(byte[] cards) {

        this.cards = cards;
    }

    public byte[] getCards() {
        return cards;
    }
}
