package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-21.
 * 游戏开始事件
 *
 * @author 席有芳
 */
public class GameEndEventResponse extends CommonResponse {

    /**
     * 椅子总数
     */
    private int chairCount;
    /**
     * 庄
     */
    private int banker;
    /**
     * 组合
     */
    private WeaveItemResponse[][] weaveItems;
    /**
     * 全部的牌
     */
    private byte[][] cards;
    /**
     * 胡牌者
     */
    private int[] chairs;
    /**
     * 供应者
     */
    private int provider;
    /**
     * 当局分数
     */
    private int[] scores;
    /**
     * 总分数
     */
    private int[] totalScores;
    /**
     * 当前牌
     */
    private byte currCard;
    /**
     * 信息
     */
    private String[] infos;

    public int getChairCount() {
        return chairCount;
    }

    public void setChairCount(int chairCount) {
        this.chairCount = chairCount;
    }

    public int getBanker() {
        return banker;
    }

    public void setBanker(int banker) {
        this.banker = banker;
    }

    public WeaveItemResponse[][] getWeaveItems() {
        return weaveItems;
    }

    public void setWeaveItems(WeaveItemResponse[][] weaveItems) {
        this.weaveItems = weaveItems;
    }

    public byte[][] getCards() {
        return cards;
    }

    public void setCards(byte[][] cards) {
        this.cards = cards;
    }

    public void setScores(int[] scores) {
        this.scores = scores;
    }

    public int[] getScores() {
        return scores;
    }

    public int[] getTotalScores() {
        return totalScores;
    }

    public void setTotalScores(int[] totalScores) {
        this.totalScores = totalScores;
    }

    public int[] getChairs() {
        return chairs;
    }

    public void setChairs(int[] chairs) {
        this.chairs = chairs;
    }

    public int getProvider() {
        return provider;
    }

    public void setProvider(int provider) {
        this.provider = provider;
    }

    public byte getCurrCard() {
        return currCard;
    }

    public void setCurrCard(byte currCard) {
        this.currCard = currCard;
    }

    public String[] getInfos() {
        return infos;
    }

    public void setInfos(String[] infos) {
        this.infos = infos;
    }
}
