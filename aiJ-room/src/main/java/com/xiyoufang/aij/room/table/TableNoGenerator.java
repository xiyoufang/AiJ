package com.xiyoufang.aij.room.table;

/**
 * Created by 席有芳 on 2019-01-28.
 * 桌子编号生成器
 *
 * @author 席有芳
 */
public interface TableNoGenerator {

    /**
     * 生成
     *
     * @return tableNo
     * @throws TableNoGenerateException TableNoGenerateException
     */
    int generate() throws TableNoGenerateException;

    /**
     * 还原服务器ID
     *
     * @param tableNo tableNo
     * @return serviceId
     */
    int serviceId(int tableNo);

    /**
     * 判断是否已经存在
     *
     * @param tableNo tableNo
     * @return boolean
     */
    boolean exist(int tableNo);

    /**
     * 释放
     *
     * @param tableNo tableNo
     */
    void release(int tableNo);
}
