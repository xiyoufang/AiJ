package com.xiyoufang.aij.room.table;

import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.room.hero.Hero;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public abstract class TableAbilityAdapter extends TableAbility {

    /**
     * 玩家进入之前
     *
     * @param hero hero
     * @return true 可以加入/false 禁止加入
     */
    @Override
    public B beforeEnter(Hero hero) {
        return B.b(true);
    }


    /**
     * 离开桌子之前
     *
     * @param chair chair 椅子位置
     * @param hero  hero 玩家
     * @return B
     */
    @Override
    public B beforeLeave(int chair, Hero hero) {
        return B.b(true);
    }

    /**
     * 离线
     *
     * @param chair chair
     * @param hero  hero
     */
    @Override
    public void offline(int chair, Hero hero) {

    }

    /**
     * 上线
     *
     * @param chair chair
     * @param hero  hero
     */
    @Override
    public void online(int chair, Hero hero) {

    }
}
