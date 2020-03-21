package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.kit.Kv;

/**
 * Created by 席有芳 on 2020-03-21.
 *
 * @author 席有芳
 */
public class BaseController extends Controller {

    /**
     * body 转成对象
     * @param clazz clazz
     * @param <T> T
     * @return T
     */
    protected <T> T body(Class<T> clazz) {
        return JsonKit.parse(getRawData(), clazz);

    }

    /**
     * ok 状态
     *
     * @param data data
     */
    protected void renderOk(Object data) {
        renderByCode(20000, data);
    }

    /**
     * 指定Code方式的渲染
     *
     * @param code code
     * @param data data
     */
    protected void renderByCode(int code, Object data) {
        renderJson(Kv.by("code", code).set("data", data));
    }
}
