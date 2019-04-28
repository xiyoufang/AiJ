package com.xiyoufang.jfinal.zk;

import com.jfinal.kit.Prop;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ZkKit {
    /**
     * zkPro
     */
    static ZkPro zkPro;
    /**
     * zkPros
     */
    static Map<String, ZkPro> zkPros = new HashMap<>();

    /**
     * 初始化
     *
     * @param name name
     * @param prop prop
     */
    static void init(String name, Prop prop) {
        ZkPro zkPro = new ZkPro(prop);
        if (ZkPlugin.DEFAULT_NAME.equals(name)) {
            ZkKit.zkPro = zkPro;
        }
        zkPros.put(name, zkPro);
    }

    /**
     * use
     *
     * @return ZkPro
     */
    public static ZkPro use() {
        return use(ZkPlugin.DEFAULT_NAME);
    }

    /**
     * @param name name
     * @return ZkPro
     */
    public static ZkPro use(String name) {
        return zkPros.get(name);
    }


}
