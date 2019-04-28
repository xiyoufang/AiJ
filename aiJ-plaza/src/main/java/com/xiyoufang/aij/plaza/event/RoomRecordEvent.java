package com.xiyoufang.aij.plaza.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-01-30.
 * 获取游戏记录
 *
 * @author 席有芳
 */
public class RoomRecordEvent extends Event {
    /**
     * 页码
     */
    private int page;
    /**
     * 每页显示条数
     */
    private int pageSize;

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
}
