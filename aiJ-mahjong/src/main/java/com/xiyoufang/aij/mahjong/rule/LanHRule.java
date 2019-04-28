package com.xiyoufang.aij.mahjong.rule;

import com.xiyoufang.aij.mahjong.MahjongKit;
import com.xiyoufang.aij.mahjong.struct.H;
import com.xiyoufang.aij.mahjong.struct.Source;
import com.xiyoufang.aij.mahjong.struct.WeaveItem;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2019-01-29.
 *
 * @author 席有芳
 */
public class LanHRule implements HRule {

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
            if (cardIndex > 1) {                   //存在两张以上相同的牌，不可能是十三烂
                return null;
            }
        }
        for (int h = 0; h < 3; h++) {
            for (int i = (h * 9); i < h * 9 + 9; ) {
                if (i < (h * 9) + 7) {           //小于8
                    byte left = indices[i];
                    byte center = indices[i + 1];
                    byte right = indices[i + 2];
                    if ((left > 0 && (center + right > 0))  // 非 1 , 0 , 0
                            || ((left == 0 && center + right > 1))) { //非 0 1 0 或者 0 0 1
                        return null;
                    } else {
                        indices[i]--;
                        i++;
                    }
                } else {
                    i++;
                }
            }
        }
        return new H._H(1, card, chair, multiple(chair, indices, card, weaveItems, self, source), info(chair, indices, card, weaveItems, self, source));
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
        if (MahjongKit.getRangeCardNumber(indices, 27, 33) == 7) {   //7星
            return 4;
        }
        return 2;
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
        if (MahjongKit.getRangeCardNumber(indices, 27, 33) == 7) {   //7星
            return self ? "自摸七星" : "七星";
        }
        return "十三烂";
    }
}
