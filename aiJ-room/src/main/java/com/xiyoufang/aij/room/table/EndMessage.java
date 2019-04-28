package com.xiyoufang.aij.room.table;

/**
 * Created by 席有芳 on 2019-01-29.
 *
 * @author 席有芳
 */
public class EndMessage {
    /**
     * 结束的详情
     */
    private String detail;
    /**
     * 结束的原因
     */
    private Table.EndReason endReason;

    public EndMessage(String detail, Table.EndReason endReason) {
        this.detail = detail;
        this.endReason = endReason;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public Table.EndReason getEndReason() {
        return endReason;
    }

    public void setEndReason(Table.EndReason endReason) {
        this.endReason = endReason;
    }
}
