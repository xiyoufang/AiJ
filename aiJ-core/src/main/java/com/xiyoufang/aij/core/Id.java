package com.xiyoufang.aij.core;

import org.tio.utils.hutool.Snowflake;

/**
 * Created by 席有芳 on 2019-01-28.
 * 此Id生成的随机，serviceId 不能超过31*31，极其小的概率在不同服务器下可能重复，同一服务器不会重复
 *
 * @author 席有芳
 */
public class Id {
    /**
     * Id实例
     */
    private static Id id;
    /**
     * snowflake
     */
    private Snowflake snowflake = null;

    /**
     * 初始化ID
     */
    static synchronized void init() {
        if (id == null) {
            id = new Id();
            int serviceId = AppConfig.use().getInt(CoreConfig.SERVICE_ID);
            id.snowflake = new Snowflake(serviceId % 31, serviceId / 31);
        }
    }

    public static long nextId() {
        return id.snowflake.nextId();
    }

    /*
    public static void main(String[] args) {
        init();
        System.out.println(nextId());
    }
     */
}
