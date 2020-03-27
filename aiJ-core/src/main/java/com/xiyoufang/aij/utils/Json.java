package com.xiyoufang.aij.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.serializer.*;

import java.util.Date;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public class Json {

    private static SerializeConfig mapping = new SerializeConfig();

    static {
        mapping.put(Date.class, new SimpleDateFormatSerializer("yyyy-MM-dd HH:mm:ss"));
        mapping.put(java.sql.Date.class, new SimpleDateFormatSerializer("yyyy-MM-dd HH:mm:ss"));
        mapping.put(java.sql.Timestamp.class, new SimpleDateFormatSerializer("yyyy-MM-dd HH:mm:ss"));
        mapping.put(java.sql.Time.class, new SimpleDateFormatSerializer("HH:mm:ss"));
    }

    public static SerializeConfig put(Class<?> clazz, SerializeFilter filter) {
        mapping.addFilter(clazz, filter);
        return mapping;
    }

    public static SerializeConfig put(Class<?> clazz, ObjectSerializer serializer) {
        mapping.put(clazz, serializer);
        return mapping;
    }

    public static <T> T toBean(String jsonString, Class<T> tt) {
        return JSON.parseObject(jsonString, tt);
    }

    /**
     * JSON字符串转数据
     *
     * @param jsonString jsonString
     * @param t          t
     * @param <T>        T
     * @return List
     */
    public static <T> List<T> toArray(String jsonString, Class<T> t) {
        return JSON.parseArray(jsonString, t);
    }

    /**
     * @param bean bean
     * @return json
     */
    public static String toPrettyJson(Object bean) {
        return JSON.toJSONString(bean, mapping, SerializerFeature.DisableCircularReferenceDetect, SerializerFeature.PrettyFormat);
    }

    /**
     * toJSONString
     *
     * @param bean bean
     * @return json
     */
    public static String toJsonStr(Object bean) {
        return JSON.toJSONString(bean, mapping, SerializerFeature.DisableCircularReferenceDetect);
    }

    /**
     * toJSON.toString
     *
     * @param bean bean
     * @return json
     */
    public static String toJson(Object bean) {
        return JSON.toJSON(bean, mapping).toString();
    }

}
