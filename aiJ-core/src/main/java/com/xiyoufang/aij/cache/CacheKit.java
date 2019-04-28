package com.xiyoufang.aij.cache;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-11-30.
 *
 * @author 席有芳
 */
public class CacheKit {

    private static ICache defaultCache = null;

    /**
     * 缓存
     */
    private static Map<String, ICache> cachePros = new HashMap<>();

    /**
     * 初始化缓存
     *
     * @param name  缓存名称
     * @param cache 缓存
     */
    static synchronized void initCache(String name, ICache cache) {
        cachePros.put(name, cache);
        if (defaultCache == null) {
            defaultCache = cache;
        }
    }

    /**
     * @param name name
     * @return ICache
     */
    public static ICache use(String name) {
        return cachePros.get(name);
    }

    public static ICache use() {
        return defaultCache;
    }
}