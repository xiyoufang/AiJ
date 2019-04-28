package com.xiyoufang.aij.mahjong.rule;

import com.xiyoufang.aij.mahjong.MahjongKit;
import com.xiyoufang.aij.mahjong.struct.*;
import org.apache.commons.math3.util.CombinatoricsUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class PingHRule implements HRule {

    /**
     * @param chair      椅子
     * @param indices    用于分析的牌
     * @param card       牌
     * @param weaveItems 桌面的牌
     * @param self       是否自己
     * @param source     来源
     * @return 校验结果
     */
    @Override
    public H._H run(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source) {
        List<KindItem> kindItems = new ArrayList<KindItem>();
        int lessItemCount = 4 - weaveItems.size();
        if (lessItemCount == 0) {    //单钓
            if (indices[MahjongKit.switchCardToIndex(card)] == 2) { //钓鱼
                return new H._H(0, card, chair,
                        multiple(chair, indices, card, weaveItems, self, source, kindItems),
                        info(chair, indices, card, weaveItems, self, source, kindItems));
            }
            return null;
        }
        for (byte i = 0; i < indices.length; i++) {           //三张一样
            if (indices[i] > 2) {
                kindItems.add(createKindItem(i, i, i, KindType.KAN));
            }
        }
        //分析筒、万、条
        for (byte h = 0; h < 3; h++) {
            for (byte i = (byte) (h * 9); i < h * 9 + 9; i++) {
                if (i < (byte) (h * 9) + 7) {    //小于8
                    normalItemGroup(indices, kindItems, i);
                }
            }
        }
        //分析东南西北
        for (byte i = 27; i < 31; i++) {
            if (i < 28) {   //写法为了统一风格
                byte p = (byte) (i + 1);
                byte q = (byte) (i + 2);
                byte r = (byte) (i + 3);
                byte east = indices[i];
                byte south = indices[p];
                byte west = indices[q];
                byte north = indices[r];
                itemGroup(kindItems, i, p, q, east, south, west);
                itemGroup(kindItems, i, p, r, east, south, north);
                itemGroup(kindItems, i, q, r, east, west, north);
                itemGroup(kindItems, p, q, r, south, west, north);
            }
        }
        //分析中发白
        for (byte i = 31; i < 34; i++) {
            if (i < 32) {
                normalItemGroup(indices, kindItems, i);
            }
        }
        int size = kindItems.size();
        if (size < lessItemCount) {  //组合不够
            return null;
        }
        //排列组合，获取可用组合
        Iterator<int[]> iterator = CombinatoricsUtils.combinationsIterator(size, lessItemCount);    //抽取缺失的数量进行组合
        while (iterator.hasNext()) {
            byte[] tempIndices = Arrays.copyOf(indices, indices.length);    //临时数组用来分析
            int[] next = iterator.next();
            boolean n = false;
            for (int i = 0; i < next.length && !n; i++) {
                KindItem kindItem = kindItems.get(next[i]);
                for (int j = 0; j < kindItem.getIndices().length && !n; j++) {
                    byte cardIndex = kindItem.getIndices()[j];
                    if (tempIndices[cardIndex] == 0) {
                        n = true;   //牌不足，组合错误。开始下一个组合
                    } else {
                        tempIndices[cardIndex]--;
                    }
                }
            }
            if (!n) {    //牌眼判断
                if (2 == MahjongKit.getCardNumber(tempIndices)) {
                    for (byte tempIndex : tempIndices) {
                        if (tempIndex == 2) {//找到牌眼，可以胡牌
                            return new H._H(0, card, chair,
                                    multiple(chair, indices, card, weaveItems, self, source, kindItems),
                                    info(chair, indices, card, weaveItems, self, source, kindItems));
                        }
                    }
                }
            }
        }
        return null;
    }

    /**
     * 番数
     *
     * @param chair      椅子
     * @param indices    用于分析的牌
     * @param card       牌
     * @param weaveItems 组合
     * @param self       是否自己
     * @param source     来源
     * @param ext        类型组合
     * @return 番数
     */
    @Override
    @SuppressWarnings("unchecked")
    public int multiple(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source, Object... ext) {
        List<KindItem> kindItems = (List<KindItem>) ext[0];
        if (weaveItems.size() == 4 || getKanCount(kindItems) == 4) {   //钓鱼 和 未碰的碰碰胡
            return 8;
        }
        if (weaveItems.size() + getKanCount(kindItems) == 4) {
            return 4;
        }
        if (source == Source.GANG && self) { //杠开
            return 4;
        }
        return 1;
    }

    /**
     * 描述
     *
     * @param chair      椅子
     * @param indices    用于分析的牌
     * @param card       牌
     * @param weaveItems 组合
     * @param self       是否自己
     * @param source     来源
     * @param ext        类型组合
     * @return 番数
     */
    @Override
    @SuppressWarnings("unchecked")
    public String info(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source, Object... ext) {
        List<KindItem> kindItems = (List<KindItem>) ext[0];
        StringBuilder sb = new StringBuilder();
        if (weaveItems.size() == 4) {
            sb.append("钓鱼");
        } else if (weaveItems.size() + getKanCount(kindItems) == 4) {
            sb.append("碰碰胡");
        }
        if (source == Source.GANG && self) {
            sb.append("杠开");
        }
        return sb.length() == 0 ? "平胡" : sb.toString();
    }


    /**
     * 常规的组合
     *
     * @param indices   indices
     * @param kindItems kindItems
     * @param i         i
     */
    private void normalItemGroup(byte[] indices, List<KindItem> kindItems, byte i) {
        byte left = indices[i];
        byte center = indices[i + 1];
        byte right = indices[i + 2];
        itemGroup(kindItems, i, (byte) (i + 1), (byte) (i + 2), left, center, right);
    }

    /**
     * 判断3连组合
     *
     * @param kindItems 组合列表
     * @param left      左边的牌
     * @param center    中间的牌
     * @param right     右边的牌
     * @param l         左边的数量
     * @param c         中间的数量
     * @param r         右边的数量
     */
    private void itemGroup(List<KindItem> kindItems, byte left, byte center, byte right, byte l, byte c, byte r) {
        if (l > 0 && c > 0 && r > 0) {
            for (byte b = 0; b < l; b++) {
                if (c >= b + 1 && r >= b + 1) {
                    kindItems.add(createKindItem(left, center, right, KindType.SHUN));
                }
            }
        }
    }

    /**
     * 可以组成组合牌
     *
     * @param a        a
     * @param b        b
     * @param c        c
     * @param kindType kindType
     * @return KindItem
     */
    private KindItem createKindItem(byte a, byte b, byte c, KindType kindType) {
        KindItem kindItem = new KindItem();
        kindItem.setIndices(new byte[]{a, b, c});
        kindItem.setKindType(kindType);
        return kindItem;
    }

    /**
     * 获取3张数量
     *
     * @param kindItems kindItems
     * @return int
     */
    private int getKanCount(List<KindItem> kindItems) {
        int i = 0; //判断
        for (KindItem kindItem : kindItems) {
            if (kindItem.getKindType() == KindType.KAN) {
                i++;
            }
        }
        return i;
    }

}
