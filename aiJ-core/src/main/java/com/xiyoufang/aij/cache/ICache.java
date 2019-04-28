package com.xiyoufang.aij.cache;

import java.util.Map;

/**
 * Created by 席有芳 on 2018-11-30.
 *
 * @author 席有芳
 */
public interface ICache {

    /**
     * 存储
     *
     * @param key   key
     * @param value value
     */
    void put(Object key, Object value);

    /**
     * 读取
     *
     * @param key key
     * @return object
     */
    <T> T get(Object key);

    /**
     * 删除
     *
     * @param key key
     */
    Object del(Object key);

    /**
     * 初始化
     *
     * @param config config
     */
    void init(Map<String, Object> config);
}
