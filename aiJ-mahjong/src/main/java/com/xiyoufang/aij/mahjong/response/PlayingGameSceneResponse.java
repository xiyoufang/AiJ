package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * 当前游戏场景状态，用于重新进入游戏客户端恢复数据
 * Created by 席有芳 on 2019-01-20.
 *
 * @author 席有芳
 */
public class PlayingGameSceneResponse extends CommonResponse {

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
     * 当前牌
     */
    private byte[] cards;
    /**
     * 当前的牌
     */
    private byte currCard;
    /**
     * 动作
     */
    private int action;
    /**
     * 动作的牌
     */
    private byte actionCard;
    /**
     * 动作的牌
     */
    private byte[] actionCards;
    /**
     * 组合
     */
    private WeaveItemResponse[][] weaveItems;
    /**
     * 出牌总数
     */
    private int[] discardCount;
    /**
     * 出牌的记录
     */
    private byte[][] discardCards;
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

    public byte getCurrCard() {
        return currCard;
    }

    public void setCurrCard(byte currCard) {
        this.currCard = currCard;
    }

    public void setAction(int action) {
        this.action = action;
    }

    public int getAction() {
        return action;
    }

    public byte getActionCard() {
        return actionCard;
    }

    public void setActionCard(byte actionCard) {
        this.actionCard = actionCard;
    }

    public byte[] getActionCards() {
        return actionCards;
    }

    public void setActionCards(byte[] actionCards) {
        this.actionCards = actionCards;
    }

    public WeaveItemResponse[][] getWeaveItems() {
        return weaveItems;
    }

    public void setWeaveItems(WeaveItemResponse[][] weaveItems) {
        this.weaveItems = weaveItems;
    }

    public int[] getDiscardCount() {
        return discardCount;
    }

    public void setDiscardCount(int[] discardCount) {
        this.discardCount = discardCount;
    }

    public byte[][] getDiscardCards() {
        return discardCards;
    }

    public void setDiscardCards(byte[][] discardCards) {
        this.discardCards = discardCards;
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

    public void setScores(int[] scores) {
        this.scores = scores;
    }

    public int[] getScores() {
        return scores;
    }
}
