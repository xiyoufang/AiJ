package com.xiyoufang.aij.mahjong.rule;

import com.xiyoufang.aij.mahjong.struct.H;
import com.xiyoufang.aij.mahjong.struct.Source;
import com.xiyoufang.aij.mahjong.struct.WeaveItem;

import java.util.List;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public interface HRule {

    /**
     * @param chair      椅子
     * @param indices    用于分析的牌
     * @param card       牌
     * @param weaveItems 组合
     * @param self       是否自己
     * @param source     来源
     * @return 校验结果
     */
    H._H run(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source);

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
    int multiple(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source, Object... ext);

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
    String info(int chair, byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, Source source, Object... ext);

}
