package com.xiyoufang.aij.core;

import com.jfinal.plugin.activerecord.DbPro;
import com.jfinal.plugin.activerecord.Record;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2019-02-21.
 *
 * @author 席有芳
 */
public class AiJDbPro extends DbPro {

    public AiJDbPro() {
    }

    public AiJDbPro(String configName) {
        super(configName);
    }

    /**
     * 保存或者更新
     *
     * @param tableName  tableName
     * @param primaryKey 主键
     * @param record     记录
     */
    public void saveOrUpdate(String tableName, String primaryKey, Record record) {
        String[] pKeys = primaryKey.split(",");
        config.getDialect().trimPrimaryKeys(pKeys);
        List<Object> values = new ArrayList<>();
        for (String pKey : pKeys) {
            values.add(record.get(pKey));
        }
        Record dbRecord = AiJCoreDb.uc().findByIds(tableName, primaryKey, values.toArray());
        if (dbRecord == null) {
            AiJCoreDb.uc().save(tableName, primaryKey, record);
        } else {
            AiJCoreDb.uc().update(tableName, primaryKey, record);
        }
    }

    /**
     * 通过唯一键更新
     *
     * @param tableName tableName
     * @param uniqueKey uniqueKey
     * @param record    record
     * @return int
     */
    public boolean updateByUnique(String tableName, String uniqueKey, Record record) {
        return update(tableName, uniqueKey, record);
    }

    /**
     * 通过唯一键查询
     *
     * @param tableName tableName
     * @param uniqueKey uniqueKey
     * @param values    values
     * @return boolean
     */
    public Record findByUnique(String tableName, String uniqueKey, Object... values) {
        return findByIds(tableName, uniqueKey, values);
    }

    /**
     * 拉链表
     *
     * @param tableName tableName
     * @param zipperKey zipperKey
     * @param record    record
     */
    public void saveZipper(String tableName, String zipperKey, Record record) {
        Record dbRecord = AiJCoreDb.uc().findByIds(tableName, zipperKey, record.get("user_id"), record.get("ended_time"));
        if (dbRecord != null) {
            dbRecord.set("ended_time", record.get("started_time"));
            AiJCoreDb.uc().update(tableName, dbRecord);             //旧的记录ended_time更新为9999-01-01 00:00:00
        }
        AiJCoreDb.uc().save(tableName, record);
    }
}
