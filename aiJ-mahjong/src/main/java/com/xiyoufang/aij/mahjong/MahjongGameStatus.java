package com.xiyoufang.aij.mahjong;

/**
 * Created by 席有芳 on 2019-01-20.
 *
 * @author 席有芳
 */
public enum MahjongGameStatus {

    GAME_PREPARE(0),
    GAME_PLAYING(1);

    private int value;

    MahjongGameStatus(int value) {
        setValue(value);
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }}
