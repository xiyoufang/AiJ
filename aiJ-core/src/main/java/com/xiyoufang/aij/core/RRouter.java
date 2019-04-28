package com.xiyoufang.aij.core;

import com.xiyoufang.aij.response.Response;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class RRouter {

    public class Type {
        public int mainType;
        public int subType;

        public Type(int mainType, int subType) {
            this.mainType = mainType;
            this.subType = subType;
        }
    }

    private Map<Class<? extends Response>, Type> router = new HashMap<>();

    /**
     * 添加响应映射
     *
     * @param cls      cls
     * @param mainType mainType
     * @param subType  subType
     */
    public void add(Class<? extends Response> cls, int mainType, int subType) {
        router.put(cls, new Type(mainType, subType));
    }

    Map<Class<? extends Response>, Type> getRouter() {
        return router;
    }
}
