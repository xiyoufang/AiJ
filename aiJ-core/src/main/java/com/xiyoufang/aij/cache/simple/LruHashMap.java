package com.xiyoufang.aij.cache.simple;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * LruHashMap
 *
 * @param <K>
 * @param <V>
 */
final class LruHashMap<K, V> extends LinkedHashMap<K, V> {

    private final int capacity;

    public LruHashMap(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    /**
     * 当大小操作 初始化大小时候移除
     *
     * @param entry entry
     * @return boolean
     */
    @Override
    protected boolean removeEldestEntry(Map.Entry entry) {
        return size() > capacity;
    }

}
