package com.xiyoufang.aij.room.table;

/**
 * Created by 席有芳 on 2019-01-31.
 *
 * @author 席有芳
 */
public class RoomRecordSummary {
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 用户昵称
     */
    private String nickName;
    /**
     * 分数
     */
    private int score;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getNickName() {
        return nickName;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }
}
