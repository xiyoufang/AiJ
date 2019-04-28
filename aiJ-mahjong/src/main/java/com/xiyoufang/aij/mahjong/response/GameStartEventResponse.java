package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2018-12-21.
 * 游戏开始事件
 *
 * @author 席有芳
 */
public class GameStartEventResponse extends CommonResponse {
    /**
     * 椅子总数
     */
    private int chairCount;
    /**
     * 座位
     */
    private int chair;
    /**
     * 骰子总数
     */
    private int diceSum;
    /**
     * 庄
     */
    private int banker;
    /**
     * 当前玩家
     */
    private int current;
    /**
     * 剩余牌数量
     */
    private int leftCardCount;
    /**
     * 牌
     */
    private byte[] cards;
    /**
     * 总局数
     */
    private int totalNumber;
    /**
     * 当前局数
     */
    private int currentNumber;
    /**
     * 分数
     */
    private int[] scores;

    public int getChairCount() {
        return chairCount;
    }

    public void setChairCount(int chairCount) {
        this.chairCount = chairCount;
    }

    public int getChair() {
        return chair;
    }

    public void setChair(int chair) {
        this.chair = chair;
    }

    public int getDiceSum() {
        return diceSum;
    }

    public void setDiceSum(int diceSum) {
        this.diceSum = diceSum;
    }

    public int getBanker() {
        return banker;
    }

    public void setBanker(int banker) {
        this.banker = banker;
    }

    public int getCurrent() {
        return current;
    }

    public void setCurrent(int current) {
        this.current = current;
    }

    public int getLeftCardCount() {
        return leftCardCount;
    }

    public void setLeftCardCount(int leftCardCount) {
        this.leftCardCount = leftCardCount;
    }

    public byte[] getCards() {
        return cards;
    }

    public void setCards(byte[] cards) {
        this.cards = cards;
    }

    public int getTotalNumber() {
        return totalNumber;
    }

    public void setTotalNumber(int totalNumber) {
        this.totalNumber = totalNumber;
    }

    public int getCurrentNumber() {
        return currentNumber;
    }

    public void setCurrentNumber(int currentNumber) {
        this.currentNumber = currentNumber;
    }

    public int[] getScores() {
        return scores;
    }

    public void setScores(int[] scores) {
        this.scores = scores;
    }
}
