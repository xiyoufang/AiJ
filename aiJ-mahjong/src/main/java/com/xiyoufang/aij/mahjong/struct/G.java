package com.xiyoufang.aij.mahjong.struct;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class G {
    /**
     * 暗杠
     */
    public static final int A = 1;
    /**
     * 明杠
     */
    public static final int M = 2;
    /**
     * 拐弯杠
     */
    public static final int G = 4;
    /**
     * 后杠
     */
    public static final int H = 8;


    public static class _G{
        /**
         * 类型
         */
        public int w;
        /**
         * 供应者位置
         */
        public int chair;
        /**
         * 牌
         */
        public byte card;

        public _G(int w, int chair, byte card) {
            this.w = w;
            this.chair = chair;
            this.card = card;
        }
    }

    public List<_G> gs;

    public G(List<_G> gs) {
        this.gs = gs;
    }
}
