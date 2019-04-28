package com.xiyoufang.aij.mahjong.record;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2019-01-28.
 * 麻将游戏记录
 *
 * @author 席有芳
 */
public class MahjongRecord {

    /**
     * 玩家
     */
    private List<MahjongPlayerRecord> mahjongPlayerRecords = new ArrayList<>();
    /**
     * 游戏
     */
    private List<MahjongGameRecord> mahjongGameRecords = new ArrayList<>();
    /**
     * 总分数
     */
    private int[] totalScores;
    /**
     * 桌子编号
     */
    private int tableNo;

    public List<MahjongPlayerRecord> getMahjongPlayerRecords() {
        return mahjongPlayerRecords;
    }

    public void setMahjongPlayerRecords(List<MahjongPlayerRecord> mahjongPlayerRecords) {
        this.mahjongPlayerRecords = mahjongPlayerRecords;
    }

    public List<MahjongGameRecord> getMahjongGameRecords() {
        return mahjongGameRecords;
    }

    public void setMahjongGameRecords(List<MahjongGameRecord> mahjongGameRecords) {
        this.mahjongGameRecords = mahjongGameRecords;
    }

    public int[] getTotalScores() {
        return totalScores;
    }

    public void setTotalScores(int[] totalScores) {
        this.totalScores = totalScores;
    }

    public int getTableNo() {
        return tableNo;
    }

    public void setTableNo(int tableNo) {
        this.tableNo = tableNo;
    }
}
