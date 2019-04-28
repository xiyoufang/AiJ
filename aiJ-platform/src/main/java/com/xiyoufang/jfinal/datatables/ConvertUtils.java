package com.xiyoufang.jfinal.datatables;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ConvertUtils {
    /**
     * 类型转换
     *
     * @param value value
     * @param cls   cls
     * @return Object
     */
    public static Object convert(String value, Class cls) {
        if (cls == Integer.class) {
            return Integer.parseInt(value);
        }
        if (cls == Boolean.class) {
            return Boolean.parseBoolean(value);
        }
        return value;
    }
}
