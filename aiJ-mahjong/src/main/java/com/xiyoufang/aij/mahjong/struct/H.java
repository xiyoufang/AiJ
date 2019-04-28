package com.xiyoufang.aij.mahjong.struct;

import java.util.List;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class H {

    public static class _H {
        /**
         * 胡牌类型
         */
        public int w;
        /**
         * 牌
         */
        public byte card;
        /**
         * 供应者
         */
        public int chair;
        /**
         * 番
         */
        public int multiple;
        /**
         * 描述
         */
        public String info;

        public _H(int w, byte card, int chair, int multiple, String info) {
            this.w = w;
            this.card = card;
            this.chair = chair;
            this.multiple = multiple;
            this.info = info;
        }
    }

    private List<_H> hs;

    public H(List<_H> hs) {
        this.hs = hs;
    }

    public List<_H> getHs() {
        return hs;
    }

    public void setHs(List<_H> hs) {
        this.hs = hs;
    }

    /**
     * 获取最大的番数
     */
    public int getMaxMultiple() {
        int maxMultiple = 0;
        if (hs == null) return maxMultiple;
        for (_H h : hs) {
            maxMultiple = Math.max(h.multiple, maxMultiple);
        }
        return maxMultiple;
    }

    /**
     * 获取胡牌的描述
     *
     * @return info
     */
    public String getInfo() {
        StringBuilder sb = new StringBuilder();
        if (hs == null) return sb.toString();
        for (_H h : hs) {
            sb.append(h.info).append(" ");
        }
        return sb.toString();
    }

}
