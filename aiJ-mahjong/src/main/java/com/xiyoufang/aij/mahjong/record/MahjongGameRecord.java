package com.xiyoufang.aij.mahjong.record;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2019-01-28.
 * 麻将游戏记录，用于放回
 *
 * @author 席有芳
 */
public class MahjongGameRecord {

    /**
     * 开始的记录
     */
    private List<MahjongGameStartRecord> mahjongGameStartRecord = new ArrayList<>();
    /**
     * 动作的记录
     */
    private List<MahjongGameActionRecord> mahjongGameActionRecords = new ArrayList<>();

    /**
     * 原始牌
     */
    private byte[] repertory;
    /**
     * 单局的分数
     */
    private int[] scores;
    /**
     * 庄
     */
    private int banker;

    public byte[] getRepertory() {
        return repertory;
    }

    public void setRepertory(byte[] repertory) {
        this.repertory = repertory;
    }

    public List<MahjongGameStartRecord> getMahjongGameStartRecord() {
        return mahjongGameStartRecord;
    }

    public void setMahjongGameStartRecord(List<MahjongGameStartRecord> mahjongGameStartRecord) {
        this.mahjongGameStartRecord = mahjongGameStartRecord;
    }

    public int[] getScores() {
        return scores;
    }

    public void setScores(int[] scores) {
        this.scores = scores;
    }

    public void setBanker(int banker) {
        this.banker = banker;
    }

    public int getBanker() {
        return banker;
    }

    public List<MahjongGameActionRecord> getMahjongGameActionRecords() {
        return mahjongGameActionRecords;
    }

    public void setMahjongGameActionRecords(List<MahjongGameActionRecord> mahjongGameActionRecords) {
        this.mahjongGameActionRecords = mahjongGameActionRecords;
    }
}
