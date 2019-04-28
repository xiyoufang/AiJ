package com.xiyoufang.aij.room.tester;

import com.neovisionaries.ws.client.WebSocket;

import java.text.MessageFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by 席有芳 on 2018-12-24.
 *
 * @author 席有芳
 */
public class TesterHeroManager {
    /**
     * 测试者管理
     */
    private Map<String, TesterHero> testerHeroes = new ConcurrentHashMap<>();
    /**
     * 实例
     */
    private static TesterHeroManager instance;

    /**
     * 获取单例
     *
     * @return HeroManager
     */
    public static synchronized TesterHeroManager getInstance() {
        if (instance == null) {
            instance = new TesterHeroManager();
        }
        return instance;
    }

    /**
     * 添加测试者
     *
     * @param testerHero testerHero
     */
    public void addTesterHero(TesterHero testerHero) {
        if (testerHeroes.containsKey(testerHero.getMobile())) {
            throw new RuntimeException(MessageFormat.format("测试ID:{0}重复，添加失败！", testerHero.getUserId()));
        }
        testerHeroes.put(testerHero.getMobile(), testerHero);
    }

    /**
     * 获取测试者
     *
     * @param testerHero testerHero
     * @return TesterHero
     */
    public TesterHero getTesterHero(TesterHero testerHero) {
        return testerHeroes.get(testerHero.getMobile());
    }

    /**
     * 根据椅子
     *
     * @param chair chair
     * @return TesterHero
     */
    public TesterHero getTesterHero(int chair) {
        for (TesterHero value : testerHeroes.values()) {
            if (value.getChair() == chair) {
                return value;
            }
        }
        return null;
    }

    /**
     * 获取测试者
     *
     * @param mobile mobile
     * @return TesterHero
     */
    public TesterHero getTesterHero(String mobile) {
        return testerHeroes.get(mobile);
    }

    /**
     * 移除
     *
     * @param mobile mobile
     * @return TesterHero
     */
    public TesterHero removeTesterHero(String mobile) {
        return testerHeroes.remove(mobile);
    }

    /**
     * 移除
     *
     * @param testerHero testerHero
     * @return TesterHero
     */
    public TesterHero removeTesterHero(TesterHero testerHero) {
        return testerHeroes.remove(testerHero.getMobile());
    }

    public Map<String, TesterHero> getTesterHeroes() {
        return testerHeroes;
    }

    /**
     * 绑定Ws
     *
     * @param testerHero testerHero
     * @param websocket  websocket
     */
    public void bindWebSocket(TesterHero testerHero, WebSocket websocket) {
        testerHero.setWebSocket(websocket);
    }

}
