package com.xiyoufang.aij.mahjong.struct;

/**
 * Created by 席有芳 on 2018/1/21.
 * 手牌组合类型
 *
 * @author 席有芳
 */
public enum KindType {

    SHUN((byte) 1),   //筒条万，三张连牌
    KAN((byte) 2),      //三张一样的牌
    ;
    private byte value;

    KindType(byte value) {
        this.value = value;
    }

    public byte getValue() {
        return value;
    }

    public void setValue(byte value) {
        this.value = value;
    }
}
