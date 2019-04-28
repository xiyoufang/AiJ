package com.xiyoufang.aij.mahjong.rule;

import com.xiyoufang.aij.mahjong.MahjongKit;
import com.xiyoufang.aij.mahjong.struct.CardType;
import com.xiyoufang.aij.mahjong.struct.H;
import com.xiyoufang.aij.mahjong.struct.Source;
import com.xiyoufang.aij.mahjong.struct.WeaveItem;

import java.util.List;

/**
 * Created by 席有芳 on 2019-01-29.
 * 清一色
 *
 * @author 席有芳
 */
public class SameColourHRule implements HRule {
    /**
     * @param chair      椅子
     * @param indices    用于分析的牌
     * @param card       牌
     * @param weaveItems 组合
     * @param self       是否自己
     * @param source     来源
     * @return 校验结果
     */
    @Override
    public H._H run(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source) {
        CardType cardType = null;   //牌的花色类型
        for (byte i = 0; i < indices.length; i++) {
            if (indices[i] > 0) {
                CardType tempType = MahjongKit.getCardIndexType(i);
                if (cardType == null) {
                    cardType = tempType;
                }
                if (cardType != tempType) {
                    return null;
                }
            }
        }
        for (WeaveItem weaveItem : weaveItems) {
            if (cardType != MahjongKit.getCardType(weaveItem.getCenterCard())) {
                return null;
            }
        }
        return new H._H(3, card, chair, multiple(chair, indices, card, weaveItems, self, source), info(chair, indices, card, weaveItems, self, source));
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
     * @param ext        额外数据
     * @return 番数
     */
    @Override
    public int multiple(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source, Object... ext) {
        if (weaveItems.size() == 0) {
            return 8;   //门清清色
        }
        if (new PingHRule().run(chair, indices, card, weaveItems, self, source) != null) {
            return 8;   //清色对号
        }
        if (source == Source.GANG && self) { //杠开
            return 8;
        }
        return 4;
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
     * @param ext        额外数据
     * @return 番数
     */
    @Override
    public String info(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source, Object... ext) {
        if (new PingHRule().run(chair, indices, card, weaveItems, self, source) != null) {
            return "清色对号";
        }
        if (source == Source.GANG && self) { //杠开
            return "清色杠开";
        }
        return "清色";
    }
}
