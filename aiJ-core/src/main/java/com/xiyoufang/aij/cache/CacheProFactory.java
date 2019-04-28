package com.xiyoufang.aij.cache;

import org.fest.reflect.core.Reflection;

import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-27.
 *
 * @author 席有芳
 */
public class CacheProFactory {

    /**
     * 注册缓存
     *
     * @param name        name
     * @param cacheProCls cacheProCls
     * @param config      config
     */
    public void registry(String name, Class<? extends ICache> cacheProCls, Map<String, Object> config) {
        ICache cache = Reflection.constructor().in(cacheProCls).newInstance();
        cache.init(config);
        CacheKit.initCache(name, cache);
    }

}
