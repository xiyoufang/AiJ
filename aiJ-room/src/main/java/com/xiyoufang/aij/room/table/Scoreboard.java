package com.xiyoufang.aij.room.table;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by 席有芳 on 2019-01-25.
 * 计分板
 *
 * @author 席有芳
 */
public class Scoreboard {

    /**
     * 分数, 局数 -> 类型 -> 椅子 -> 分数
     */
    private Map<Integer, Map<Integer, Map<Integer, Integer>>> scores = new ConcurrentHashMap<>();

    /**
     * 写入分数
     *
     * @param number 局数
     * @param type   type
     * @param chair  chair
     * @param score  score
     */
    public void writeScore(int number, int type, int chair, int score) {
        if (!scores.containsKey(number)) {
            scores.put(number, new HashMap<Integer, Map<Integer, Integer>>());
        }
        Map<Integer, Map<Integer, Integer>> typeScore = scores.get(number);
        if (!typeScore.containsKey(type)) {
            typeScore.put(type, new HashMap<Integer, Integer>());
        }
        Map<Integer, Integer> chairScore = typeScore.get(type);
        if (!chairScore.containsKey(chair)) {
            chairScore.put(chair, 0);
        }
        chairScore.put(chair, chairScore.get(chair) + score);
    }

    /**
     * 读取Chair分数
     *
     * @param chair chair
     * @return score
     */
    public int readScore(int chair) {
        int score = 0;
        for (Map<Integer, Map<Integer, Integer>> typeValue : scores.values()) {
            for (Map<Integer, Integer> value : typeValue.values()) {
                if (value.containsKey(chair)) {
                    score += value.get(chair);
                }
            }
        }
        return score;
    }

    /**
     * 读取Chair分数
     *
     * @param chair  chair
     * @param number number
     * @return score
     */
    public int readScore(int chair, int number) {
        int score = 0;
        if (scores.containsKey(number)) {
            Map<Integer, Map<Integer, Integer>> typeScore = scores.get(number);
            for (Map<Integer, Integer> value : typeScore.values()) {
                if (value.containsKey(chair)) {
                    score += value.get(chair);
                }
            }
        }
        return score;
    }

    /**
     * @param chair  椅子
     * @param number 局数
     * @param type   类型
     * @return score
     */
    public int readScore(int chair, int number, int type) {
        int score = 0;
        if (scores.containsKey(number)) {
            Map<Integer, Map<Integer, Integer>> typeScore = scores.get(number);
            if (typeScore.containsKey(type)) {
                Map<Integer, Integer> chairScore = typeScore.get(type);
                if (chairScore.containsKey(chair)) {
                    score += chairScore.get(chair);
                }
            }
        }
        return score;
    }

    /**
     * 获取局数
     *
     * @return 局数列表
     */
    public List<Integer> getNumbers() {
        List<Integer> numbers = new ArrayList<>(scores.keySet());
        Collections.sort(numbers);
        return numbers;
    }
}
