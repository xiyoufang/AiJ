package com.xiyoufang.aij.core;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class CoreDs {
    /**
     * 数据源
     */
    private Map<String, AiJDs> dss = new HashMap<>();

    public CoreDs() {

    }

    protected CoreDs(CoreDs coreDs) {
        this.dss = coreDs.dss;
    }

    /**
     * 添加用户中心数据源
     *
     * @param ds ds
     */
    public void addUserCenterDs(AiJDs ds) {
        dss.put(AppConfig.use().getStr(CoreConfig.DS_USER_CENTER), ds);
    }

    /**
     * 获取用户中心数据源
     *
     * @return ds
     */
    public AiJDs getUserCenterDs() {
        return dss.get(AppConfig.use().getStr(CoreConfig.DS_USER_CENTER));
    }

    /**
     * 添加平台数据源
     *
     * @param ds ds
     */
    public void addPlatformDs(AiJDs ds) {
        dss.put(AppConfig.use().getStr(CoreConfig.DS_PLATFORM), ds);
    }

    /**
     * 获取平台数据源
     *
     * @return ds
     */
    public AiJDs getPlatformDs() {
        return dss.get(AppConfig.use().getStr(CoreConfig.DS_PLATFORM));
    }

    /**
     * 添加指定名称的数据源
     *
     * @param name name
     * @param ds   ds
     */
    public void add(String name, AiJDs ds) {
        dss.put(name, ds);
    }

    /**
     * 获取指定名称的数据源
     *
     * @param name name
     */
    public AiJDs get(String name) {
        return dss.get(name);
    }

    public Map<String, AiJDs> getDss() {
        return dss;
    }
}
