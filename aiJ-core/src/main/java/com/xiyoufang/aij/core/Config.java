package com.xiyoufang.aij.core;

import com.jfinal.kit.StrKit;

import java.util.HashMap;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
@SuppressWarnings("unchecked")
public class Config extends HashMap<String, String> {


    /**
     * 没有值，或者值为null
     *
     * @param key key
     * @return boolean
     */
    public boolean yes(String key) {
        return !StrKit.isBlank(get(key));
    }

    /**
     * value转成int
     *
     * @param key key
     * @return int
     */
    public int getInt(String key) {
        return Integer.parseInt(get(key));
    }

    /**
     * @param key key
     * @return str
     */
    public String getStr(String key) {
        return get(key);
    }

    /**
     * @param key key
     * @return bool
     */
    public boolean getBool(String key) {
        return Boolean.valueOf(get(key));
    }

    /**
     * @param key key
     * @param cls cls
     * @param <T> type
     * @return class
     * @throws ClassNotFoundException ClassNotFoundException
     */
    public <T> Class<T> getClass(String key, Class<T> cls) throws ClassNotFoundException {
        return (Class<T>) Class.forName(get(key));
    }

    /**
     * put int value
     *
     * @param key   key
     * @param value value
     */
    public void setInt(String key, int value) {
        put(key, String.valueOf(value));
    }

    /**
     * put str value
     *
     * @param key   key
     * @param value value
     */
    public void setStr(String key, String value) {
        put(key, value);
    }

    /**
     * put boolean value
     *
     * @param key   key
     * @param value value
     */
    public void setBool(String key, boolean value) {
        put(key, String.valueOf(value));
    }

    /**
     * put class value
     *
     * @param key   key
     * @param value value
     */
    public void setClass(String key, Class value) {
        put(key, value.getName());
    }

}
