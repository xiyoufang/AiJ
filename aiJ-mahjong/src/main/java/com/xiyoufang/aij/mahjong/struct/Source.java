package com.xiyoufang.aij.mahjong.struct;

/**
 * Created by 席有芳 on 2018/1/22.
 * 检测类型
 *
 * @author 席有芳
 */
public enum Source {
    OUT,        //出牌检测是否能够（碰、杠、胡）
    IN,         //摸牌检测（杠、胡）
    GANG        //杠牌检测（枪杆）
}
