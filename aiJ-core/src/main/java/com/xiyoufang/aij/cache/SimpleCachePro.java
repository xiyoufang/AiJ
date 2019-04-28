package com.xiyoufang.aij.cache;


import com.jfinal.kit.StrKit;
import com.xiyoufang.aij.cache.simple.LruCache;
import com.xiyoufang.aij.cache.simple.SimpleCache;

import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-03.
 *
 * @author 席有芳
 */
public class SimpleCachePro implements ICache {
    /**
     * 缓存名称
     */
    public static final String TYPE_NAME = "simple.cache";
    /**
     * capacity
     */
    private final static String CACHE_SIZE = "simple.cache.capacity";
    /**
     *
     */
    private SimpleCache<Object, Object> simpleCache;

    /**
     * 初始化
     *
     * @param props props
     */
    @Override
    public void init(Map<String, Object> props) {
        int capacity = StrKit.notBlank((String) props.get(CACHE_SIZE)) ? Integer.parseInt((String) props.get(CACHE_SIZE)) : LruCache.DEFAULT_CAPACITY;
        this.simpleCache = new LruCache<>(capacity);
    }

    /**
     * 存储
     *
     * @param key   key
     * @param value value
     */
    @Override
    public void put(Object key, Object value) {
        this.simpleCache.put(key, value);
    }

    /**
     * 读取
     *
     * @param key key
     * @return T
     */
    @Override
    @SuppressWarnings("unchecked")
    public <T> T get(Object key) {
        return (T) this.simpleCache.get(key);
    }

    /**
     * 删除
     *
     * @param key key
     * @return long
     */
    @Override
    public Object del(Object key) {
        return this.simpleCache.remove(key);
    }

}
