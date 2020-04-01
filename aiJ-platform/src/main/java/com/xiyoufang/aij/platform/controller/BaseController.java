package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.Controller;
import com.jfinal.kit.JsonKit;
import com.jfinal.kit.Kv;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;
import com.xiyoufang.aij.platform.domain.UserDO;
import org.apache.shiro.SecurityUtils;

/**
 * Created by 席有芳 on 2020-03-21.
 *
 * @author 席有芳
 */
public class BaseController extends Controller {

    /**
     * body 转成对象
     *
     * @param clazz clazz
     * @param <T>   T
     * @return T
     */
    protected <T> T body(Class<T> clazz) {
        return JsonKit.parse(getRawData(), clazz);
    }

    /**
     * 用户信息
     *
     * @return UserDO
     */
    protected UserDO userDO() {
        return (UserDO) SecurityUtils.getSubject().getPrincipal();
    }

    /**
     * ok 状态
     *
     * @param kv kv
     */
    protected void renderOk(Kv kv) {
        renderWithCode(ResponseStatusCode.OK, kv);
    }

    /**
     * 指定Code方式的渲染
     *
     * @param code code
     * @param kv   附加的信息
     */
    protected void renderWithCode(int code, Kv kv) {
        renderJson(Kv.by(ResponseStatusCode.CODE_KEY, code).set(kv));
    }

    /**
     * 通过KV渲染
     *
     * @param kv kv
     */
    protected void renderKv(Kv kv) {
        renderJson(kv);
    }

}
