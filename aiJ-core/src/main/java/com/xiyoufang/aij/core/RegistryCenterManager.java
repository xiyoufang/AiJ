package com.xiyoufang.aij.core;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-27.
 *
 * @author 席有芳
 */
public class RegistryCenterManager {
    /**
     * 注册中心
     */
    private static Map<String, RegistryCenter> registryCenters = new HashMap<>();

    private static final String DEFAULT = "DEFAULT";

    /**
     * 初始化
     *
     * @param registryCenter registryCenter
     */
    static void init(RegistryCenter registryCenter) {
        init(DEFAULT, registryCenter);
    }

    /**
     * 初始化
     *
     * @param name           名称
     * @param registryCenter registryCenter
     */
    static void init(String name, RegistryCenter registryCenter) {
        registryCenters.put(name, registryCenter);
    }

    /**
     * 获取默认注册中心
     *
     * @return registryCenter
     */
    public static RegistryCenter use() {
        return registryCenters.get(DEFAULT);
    }

    /**
     * 获取指定注册中心
     *
     * @param name name
     * @return RegistryCenter
     */
    public static RegistryCenter use(String name) {
        return registryCenters.get(name);
    }

}
