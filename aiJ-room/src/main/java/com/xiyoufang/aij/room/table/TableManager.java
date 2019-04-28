package com.xiyoufang.aij.room.table;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.room.config.RoomConfig;
import com.xiyoufang.aij.room.hero.Hero;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class TableManager {
    /**
     * 实例
     */
    private static TableManager instance;
    /**
     * 默认最大在线数量
     */
    private static final int DEFAULT_MAX_TABLE = 2048;
    /**
     * 单台服务器最大桌子数
     */
    private int maxTable = DEFAULT_MAX_TABLE;
    /**
     * 桌子
     */
    private Map<Integer, Table> tables = new ConcurrentHashMap<>();
    /**
     * 桌子实现
     */
    private Class<? extends TableAbility> tableAbilityCls;

    /**
     * 日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(TableManager.class);

    /**
     * 初始化
     */
    void init() {
        if (AppConfig.use().yes(RoomConfig.TABLE_MAX)) {
            maxTable = AppConfig.use().getInt(RoomConfig.TABLE_MAX);
        }
        try {
            if (!AppConfig.use().yes(RoomConfig.TABLE_ABILITY)) {
                throw new RuntimeException("TableAbility类不允许为空!");
            }
            tableAbilityCls = AppConfig.use().getClass(RoomConfig.TABLE_ABILITY, TableAbility.class);
        } catch (ClassNotFoundException e) {
            LOGGER.error("Table Ability创建实例失败!", e);
            throw new RuntimeException("获取TableAbility类失败", e);
        }
        new Timer().schedule(new java.util.TimerTask() {         //定时任务
            @Override
            public void run() {
                long startedTime = System.currentTimeMillis();
                for (Table table : tables.values()) {
                    table.run((int) (System.currentTimeMillis() - startedTime));
                }
            }
        }, 0, 500);
    }

    /**
     * 获取单例
     *
     * @return HeroManager
     */
    public static synchronized TableManager getInstance() {
        if (instance == null) {
            instance = new TableManager();
            instance.init();
        }
        return instance;
    }

    /**
     * 创建桌子
     *
     * @param hero     创建者
     * @param ruleText 规则
     * @return boolean
     */
    public synchronized B create(Hero hero, String ruleText) {
        if (tables.size() >= maxTable) {
            return B.b(false, "不能创建更多的桌子,请稍后!");
        }
        try {
            Table table = new Table(hero, ruleText, tableAbilityCls);
            tables.put(table.getTableNo(), table);
            return B.b(true, table);
        } catch (TableNoGenerateException e) {
            LOGGER.error("房间号生成失败!", e);
            return B.b(false, "生成房间号失败,请稍后再试!");
        }
    }

    /**
     * 移除桌子
     *
     * @param table table
     */
    public void remove(Table table) {
        tables.remove(table.getTableNo());
    }

    /**
     * 通过编号获取table
     *
     * @param tableNo tableNo
     * @return Table
     */
    public Table getTable(int tableNo) {
        return tables.get(tableNo);
    }

    /**
     * 获取全部桌子
     *
     * @return tables
     */
    public List<Table> getTables() {
        return new ArrayList<>(tables.values());
    }

    /**
     * 获取所属的Tables
     *
     * @param hero hero
     * @return tables
     */
    public List<Table> getOwnerTables(Hero hero) {
        List<Table> ts = new ArrayList<>();
        Collection<Table> values = tables.values();
        for (Table table : values) {
            Hero owner = table.getOwner();
            if (hero.getUserId().equals(owner.getUserId())) {
                ts.add(table);
            }
        }
        return ts;
    }

    /**
     * 获取玩家当前所在的桌子
     *
     * @param hero hero
     * @return hero
     */
    public Table getCurrTable(Hero hero) {
        if (hero == null) {
            return null;
        }
        return tables.get(hero.getTableNo());
    }

}
