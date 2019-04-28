package com.xiyoufang.aij.room.tester;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.CoreConfig;

/**
 * Created by 席有芳 on 2018-12-24.
 *
 * @author 席有芳
 */
public class TesterConfig {

    private String wsUrl;

    public TesterConfig() {
        wsUrl = "ws://127.0.0.1" + ":" + AppConfig.use().getInt(CoreConfig.WS_PORT);
    }

    public void setWsUrl(String wsUrl) {
        this.wsUrl = wsUrl;
    }

    public String getWsUrl() {
        return wsUrl;
    }

    /**
     * 添加测试则
     *
     * @param mobile       用户mobile
     * @param password) 用户密码
     */
    public void addTester(String mobile, String password) {
        TesterHero testerHero = new TesterHero();
        testerHero.setMobile(mobile);
        testerHero.setPassword(password);
        TesterHeroManager.getInstance().addTesterHero(testerHero);
    }

}
