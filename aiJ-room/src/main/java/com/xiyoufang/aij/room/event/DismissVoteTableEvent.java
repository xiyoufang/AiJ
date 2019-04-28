package com.xiyoufang.aij.room.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-02-01.
 *
 * @author 席有芳
 */
public class DismissVoteTableEvent extends Event {
    /**
     * 同意
     */
    private boolean agree;

    public boolean isAgree() {
        return agree;
    }

    public void setAgree(boolean agree) {
        this.agree = agree;
    }
}
