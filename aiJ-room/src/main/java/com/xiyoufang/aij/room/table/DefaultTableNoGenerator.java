package com.xiyoufang.aij.room.table;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.room.config.RoomConfig;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by 席有芳 on 2019-01-28.
 * 该生成器，只支持服务ID最大不超过199的，生成6位数
 *
 * @author 席有芳
 */
public class DefaultTableNoGenerator implements TableNoGenerator {

    /**
     * 桌子编号
     */
    private Map<Integer, Long> tableNos = new ConcurrentHashMap<>();

    /**
     * 生成
     *
     * @return tableNo
     */
    @Override
    public int generate() throws TableNoGenerateException {
        int serviceId = AppConfig.use().getInt(RoomConfig.SERVICE_ID);//服务器唯一标识
        if (serviceId > 199) {
            throw new TableNoGenerateException("不支持serviceId超过199的服务");
        }
        List<Integer> prefix = new ArrayList<>();
        if (serviceId >= 100) {
            prefix.add(serviceId);
        }
        while ((serviceId = (200 + serviceId)) < 1000) {
            prefix.add(serviceId);
        }
        int size = prefix.size();
        for (int i = 0; i < 1000; i++) {
            int tableNo = prefix.get(new Random().nextInt(size)) * 1000 + new Random().nextInt(1000);
            if (!exist(tableNo)) {
                tableNos.put(tableNo, System.currentTimeMillis());
                return tableNo;
            }
        }
        throw new TableNoGenerateException("生成不重复的TableNo失败!");
    }

    /**
     * 还原服务器ID
     *
     * @param tableNo tableNo
     * @return serviceId
     */
    @Override
    public int serviceId(int tableNo) {
        int serviceId = tableNo / 1000;
        if (serviceId < 200) {
            return serviceId;
        }
        while (serviceId > 200) {
            serviceId = serviceId - 200;
        }
        return serviceId;
    }

    /**
     * 判断是否已经存在
     *
     * @param tableNo tableNo
     * @return boolean
     */
    @Override
    public boolean exist(int tableNo) {
        return tableNos.containsKey(tableNo);
    }

    /**
     * 释放
     *
     * @param tableNo tableNo
     */
    @Override
    public void release(int tableNo) {
        tableNos.remove(tableNo);
    }

//
//    public static void main(String[] args) throws TableNoGenerateException {
//        DefaultTableNoGenerator generator = new DefaultTableNoGenerator();
//        for (int i = 0; i < 100000; i++) {
//            System.out.println(generator.generate());
//        }
//    }

}
