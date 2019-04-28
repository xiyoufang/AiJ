package com.xiyoufang.aij.room.table;

import com.xiyoufang.aij.core.Config;
import org.tio.utils.json.Json;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class Rule extends Config {


    /**
     * JSON转对象
     *
     * @param ruleText ruleText
     * @return Rule
     */
    public static Rule toRule(String ruleText) {
        return Json.toBean(ruleText, Rule.class);
    }

    public String toJson() {
        return Json.toJson(this);
    }
}
