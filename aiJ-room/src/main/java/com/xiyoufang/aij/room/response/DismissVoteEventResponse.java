package com.xiyoufang.aij.room.response;

import com.xiyoufang.aij.response.Response;

/**
 * Created by 席有芳 on 2019-02-01.
 *
 * @author 席有芳
 */
public class DismissVoteEventResponse extends Response {
    /**
     * 投票状态
     */
    private int status;
    /**
     * 投票时间
     */
    private String voteTime;
    /**
     * 倒计时
     */
    private int countDown;
    /**
     * 同意
     */
    private int[] agrees;
    /**
     * 拒绝
     */
    private int[] refuses;

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getVoteTime() {
        return voteTime;
    }

    public void setVoteTime(String voteTime) {
        this.voteTime = voteTime;
    }

    public int getCountDown() {
        return countDown;
    }

    public void setCountDown(int countDown) {
        this.countDown = countDown;
    }

    public int[] getAgrees() {
        return agrees;
    }

    public void setAgrees(int[] agrees) {
        this.agrees = agrees;
    }

    public int[] getRefuses() {
        return refuses;
    }

    public void setRefuses(int[] refuses) {
        this.refuses = refuses;
    }
}
