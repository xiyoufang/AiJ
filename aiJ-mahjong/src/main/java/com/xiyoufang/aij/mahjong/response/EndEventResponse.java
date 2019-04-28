package com.xiyoufang.aij.mahjong.response;

import com.xiyoufang.aij.response.CommonResponse;

/**
 * Created by 席有芳 on 2019-01-31.
 *
 * @author 席有芳
 */
public class EndEventResponse extends CommonResponse {
    /**
     * 开始时间
     */
    private String startedTime;
    /**
     * 结束时间
     */
    private String endedTime;
    /**
     * 房号
     */
    private int tableNo;
    /**
     * 分数
     */
    private int[] score;

    /**
     * 统计
     */
    private int[][] actionStatistics;


    public String getStartedTime() {
        return startedTime;
    }

    public void setStartedTime(String startedTime) {
        this.startedTime = startedTime;
    }

    public int[] getScore() {
        return score;
    }

    public void setScore(int[] score) {
        this.score = score;
    }

    public String getEndedTime() {
        return endedTime;
    }

    public void setEndedTime(String endedTime) {
        this.endedTime = endedTime;
    }

    public int getTableNo() {
        return tableNo;
    }

    public void setTableNo(int tableNo) {
        this.tableNo = tableNo;
    }

    public int[][] getActionStatistics() {
        return actionStatistics;
    }

    public void setActionStatistics(int[][] actionStatistics) {
        this.actionStatistics = actionStatistics;
    }
}


