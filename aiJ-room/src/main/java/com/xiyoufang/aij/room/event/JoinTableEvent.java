package com.xiyoufang.aij.room.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class JoinTableEvent extends Event {

    /**
     * 桌号
     */
    private int tableNo;

    public int getTableNo() {
        return tableNo;
    }

    public void setTableNo(int tableNo) {
        this.tableNo = tableNo;
    }
}
