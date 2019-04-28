package com.xiyoufang.aij.mahjong.struct;

import java.util.List;

/**
 * 手上的牌类型组合
 */
public class KindItem {

    /**
     * 组合类型
     */
    private KindType kindType;
    /**
     * 列表牌
     */
    private byte[] indices;

    public KindItem() {
    }

    public KindItem(KindType kindType, byte[] indices) {
        this.kindType = kindType;
        this.indices = indices;
    }

    public KindType getKindType() {
        return kindType;
    }

    public void setKindType(KindType kindType) {
        this.kindType = kindType;
    }

    public byte[] getIndices() {
        return indices;
    }

    public void setIndices(byte[] indices) {
        this.indices = indices;
    }
}
