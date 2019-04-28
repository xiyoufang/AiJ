package com.xiyoufang.aij.mahjong.struct;

/**
 * Created by 席有芳 on 2018/1/21.
 * 面牌组合类型
 *
 * @author 席有芳
 */
public enum WeaveType {

    C((byte) 1),   //吃
    P((byte) 2),   //碰
    G((byte) 3);    //杠

    private byte value;

    WeaveType(byte value) {
        this.value = value;
    }

    public byte getValue() {
        return value;
    }

    public void setValue(byte value) {
        this.value = value;
    }
}
