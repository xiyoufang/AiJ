package com.xiyoufang.aij.room.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public class CreateTableEvent extends Event {

    /**
     * 规则
     */
    private String ruleText;

    public String getRuleText() {
        return ruleText;
    }

    public void setRuleText(String ruleText) {
        this.ruleText = ruleText;
    }
}
