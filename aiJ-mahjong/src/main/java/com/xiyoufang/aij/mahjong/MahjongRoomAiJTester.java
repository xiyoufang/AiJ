package com.xiyoufang.aij.mahjong;

import com.xiyoufang.aij.mahjong.tester.*;
import com.xiyoufang.aij.room.tester.RoomAiJTester;
import com.xiyoufang.aij.room.tester.TRouter;
import com.xiyoufang.aij.room.tester.TesterConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Created by 席有芳 on 2018-12-24.
 *
 * @author 席有芳
 */
public class MahjongRoomAiJTester extends RoomAiJTester {

    private final static Logger LOGGER = LoggerFactory.getLogger(MahjongRoomAiJTester.class);


    /**
     * 配置测试参数
     *
     * @param testerConfig testerConfig
     */
    @Override
    protected void testerConfig(TesterConfig testerConfig) {
        testerConfig.addTester("15000000001", "123456");
        testerConfig.addTester("15000000002", "123456");
        testerConfig.addTester("15000000003", "123456");
//        testerConfig.addTester("15000000004",  "123456");
    }

    /**
     * 配置测试用的路由
     *
     * @param tRouter tRouter
     */
    @Override
    protected void configTRouter(TRouter tRouter) {
        tRouter.addRouter(1, 1, new LoginResponseHandler());
        tRouter.addRouter(1, 2, new LoginNotifyResponseHandler());
        tRouter.addRouter(2, 1, new CreateTableResponseHandler());
        tRouter.addRouter(2, 2, new JoinTableResponseHandler());
        tRouter.addRouter(2, 9, new HeroSceneResponseHandler());
        tRouter.addRouter(8, 0, new GameStartResponseHandler());
        tRouter.addRouter(8, 1, new DispatchCardResponseHandler());
        tRouter.addRouter(8, 2, new OutCardResponseHandler());
        tRouter.addRouter(8, 3, new OperateNotifyResponseHandler());
        tRouter.addRouter(8, 4, new OperateResultEventHandler());
        tRouter.addRouter(8, 9, new EndEventResponseHandler());
    }

    @Override
    protected void onAfterWs() {
        new MahjongRoomAiJTesterGui();
    }


    /**
     * 开始回调，不保证服务器正常连接
     */
    @Override
    protected void onStart() {

    }
}
