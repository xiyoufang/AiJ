package com.xiyoufang.aij.room.config;

import com.xiyoufang.aij.core.CoreConfig;
import com.xiyoufang.aij.room.table.TableAbility;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class RoomConfig extends CoreConfig {

    /**
     * 功能Class
     */
    public static final String TABLE_ABILITY = "$table.ability";

    /**
     * 最大桌子数
     */
    public static final String TABLE_MAX = "$table.max";

    /**
     *
     */
    public static final String ENABLE_ANDROID = "$enable_android";

    /**
     * 最大玩家数量
     */
    public static final String HERO_MAX = "$hero.max";

    /**
     * 游戏数据源
     */
    public static final String DS_ROOM = "$ds_room";


    /**
     * Cls
     *
     * @param cls cls
     */
    public void setTableAbility(Class<? extends TableAbility> cls) {
        setClass(TABLE_ABILITY, cls);
    }

    /**
     * 最大桌子数
     *
     * @param max max
     */
    public void setTableMax(int max) {
        setInt(TABLE_MAX, max);
    }

    /**
     * 最大玩家数
     *
     * @param max max
     */
    public void setHeroMax(int max) {
        setInt(HERO_MAX, max);
    }

    /**
     * 设置房间数据源
     *
     * @param name name
     */
    public void setDsRoom(String name) {
        setStr(DS_ROOM, name);
    }

    /**
     * 启用机器人
     *
     * @param enable enable
     */
    public void setEnableAndroid(boolean enable) {
        setBool(ENABLE_ANDROID, enable);
    }


}