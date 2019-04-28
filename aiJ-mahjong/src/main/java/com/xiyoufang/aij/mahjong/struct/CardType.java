package com.xiyoufang.aij.mahjong.struct;

/**
 * Created by 席有芳 on 2018/1/24.
 *
 * @author 席有芳
 */
public enum CardType {

    TO((byte) 0, "筒"),
    W((byte) 1, "萬"),
    T((byte) 2, "條"),
    F((byte) 3, "風");

    private byte value;

    private String name;

    CardType(byte value, String name) {
        this.value = value;
        this.name = name;
    }

    public byte getValue() {
        return value;
    }

    public String getName() {
        return name;
    }

    /**
     * 获取牌类型
     *
     * @param value value
     * @return CardType
     */
    public static CardType getCardType(byte value) {
        for (CardType cardType : CardType.values()) {
            if (cardType.value == value) {
                return cardType;
            }
        }
        return null;
    }
}
