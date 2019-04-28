package com.xiyoufang.aij.plaza.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-03-01.
 *
 * @author 席有芳
 */
public class RechargeRecordEvent extends Event {
    /**
     * 页码
     */
    private int page;
    /**
     * 每页显示条数
     */
    private int pageSize;
    /**
     * 类型
     */
    private String assetCode;

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public String getAssetCode() {
        return assetCode;
    }

    public void setAssetCode(String assetCode) {
        this.assetCode = assetCode;
    }
}
