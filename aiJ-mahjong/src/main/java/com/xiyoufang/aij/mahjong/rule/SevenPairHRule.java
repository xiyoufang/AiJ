package com.xiyoufang.aij.mahjong.rule;

import com.xiyoufang.aij.mahjong.struct.H;
import com.xiyoufang.aij.mahjong.struct.Source;
import com.xiyoufang.aij.mahjong.struct.WeaveItem;

import java.util.List;

/**
 * Created by 席有芳 on 2019-01-29.
 * 七对
 *
 * @author 席有芳
 */
public class SevenPairHRule implements HRule {
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
        if (weaveItems.size() > 0) {
            return null;
        }
        for (byte cardIndex : indices) {
            if (cardIndex % 2 != 0) {       //奇数的牌
                return null;
            }
        }
        return new H._H(2, card, chair, multiple(chair, indices, card, weaveItems, self, source), info(chair, indices, card, weaveItems, self, source));
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
        return 8;
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
        return self ? "自摸七对" : "七对";
    }
}
