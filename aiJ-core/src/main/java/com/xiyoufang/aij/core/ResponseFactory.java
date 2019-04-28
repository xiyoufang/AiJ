package com.xiyoufang.aij.core;

import com.xiyoufang.aij.response.Response;
import org.fest.reflect.core.Reflection;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class ResponseFactory {

    private static RRouter router;

    /**
     * 初始化
     *
     * @param router router
     */
    static void init(RRouter router) {
        ResponseFactory.router = router;
    }

    /**
     * 创建Response
     *
     * @param cls cls
     * @param <T> T
     * @return Response
     */
    public static <T extends Response> T success(Class<T> cls) {
        T t = Reflection.constructor().in(cls).newInstance();
        t.setCode(Response.SUCCESS);
        RRouter.Type type = router.getRouter().get(cls);
        t.setMainType(type.mainType);
        t.setSubType(type.subType);
        return t;
    }

    /**
     * 创建Response
     *
     * @param cls     cls
     * @param message message
     * @param <T>     T
     * @return Response
     */
    public static <T extends Response> T success(Class<T> cls, String message) {
        T t = success(cls);
        t.setMessage(message);
        return t;
    }

    /**
     * 创建Response
     *
     * @param cls cls
     * @param <T> T
     * @return Response
     */
    public static <T extends Response> T error(Class<T> cls) {
        T t = Reflection.constructor().in(cls).newInstance();
        t.setCode(Response.ERROR);
        RRouter.Type type = router.getRouter().get(cls);
        t.setMainType(type.mainType);
        t.setSubType(type.subType);
        return t;
    }

    /**
     * 创建Response
     *
     * @param cls     cls
     * @param message message
     * @param <T>     T
     * @return Response
     */
    public static <T extends Response> T error(Class<T> cls, String message) {
        T t = error(cls);
        t.setMessage(message);
        return t;
    }

}
