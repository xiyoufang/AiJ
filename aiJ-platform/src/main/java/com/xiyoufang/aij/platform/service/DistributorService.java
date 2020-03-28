package com.xiyoufang.aij.platform.service;

import com.jfinal.aop.Duang;
import com.jfinal.plugin.activerecord.Record;

/**
 * Created by 席有芳 on 2020-03-28.
 * 代理
 *
 * @author 席有芳
 */
public class DistributorService {
    /**
     * 单例，实例
     */
    public final static DistributorService me = Duang.duang(DistributorService.class);

    /**
     * 保存
     *
     * @param record record
     * @return boolean
     */
    public boolean save(Record record) {
        return false;
    }

    /**
     * 更新
     *
     * @param record record
     * @return boolean
     */
    public boolean update(Record record) {
        return false;
    }
}
