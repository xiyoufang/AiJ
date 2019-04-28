package com.xiyoufang.aij.room.response;

import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.event.CreateTableEvent;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public class CreateTableEventResponse extends CommonResponse {
    /**
     * 桌子编号
     */
    private int tableNo;

    public int getTableNo() {
        return tableNo;
    }

    public void setTableNo(int tableNo) {
        this.tableNo = tableNo;
    }
}
