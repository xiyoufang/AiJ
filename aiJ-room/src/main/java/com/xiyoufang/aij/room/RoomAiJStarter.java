package com.xiyoufang.aij.room;

import com.xiyoufang.aij.core.*;
import com.xiyoufang.aij.room.config.RoomConfig;
import com.xiyoufang.aij.room.config.RoomDs;
import com.xiyoufang.aij.room.handler.*;
import com.xiyoufang.aij.room.listener.RoomTioListener;
import com.xiyoufang.aij.room.monitor.MonitorTask;
import com.xiyoufang.aij.room.response.*;
import com.xiyoufang.aij.room.robot.RoomAiJRobot;
import com.xiyoufang.aij.room.table.TableAbility;
import com.xiyoufang.aij.room.tester.RoomAiJTester;
import com.xiyoufang.aij.timer.TimerSchedule;
import org.fest.reflect.core.Reflection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.server.ServerTioConfig;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public abstract class RoomAiJStarter extends AiJStarter {
    /**
     * 日志
     */
    private final static Logger LOGGER = LoggerFactory.getLogger(RoomAiJStarter.class);

    /**
     * 配置 configTableAbility
     *
     * @return TableAbility
     */
    protected abstract Class<? extends TableAbility> configTableAbility();

    /**
     * 服务描述
     *
     * @return description
     */
    @Override
    protected String configNodeDescription() {
        return "游戏房间服务";
    }

    /**
     * 初始化自定义配置
     *
     * @param config config
     */
    protected void configCustomConfig(RoomConfig config) {
    }

    /**
     * 配置自定义数据源
     *
     * @param ds ds
     */
    protected void configCustomDs(RoomDs ds) {
    }

    /**
     * 添加游戏数据源
     *
     * @return DataSource
     */
    protected abstract AiJDs configRoomDs();

    /**
     * 配置自定义指令路由
     *
     * @param router router
     */
    protected abstract void configCustomRouter(Router router);

    /**
     * 配置自定义Response路由
     *
     * @param rRouter rRouter
     */
    protected abstract void configCustomRRouter(RRouter rRouter);

    /**
     * 配置自定义 serverTioConfig
     *
     * @param serverTioConfig serverTioConfig
     */
    protected abstract void configCustomServerTioConfig(ServerTioConfig serverTioConfig);

    /**
     * 房间启动回调
     */
    protected abstract void onRoomStart();

    /**
     * 配置测试工具
     *
     * @return RoomAiJTester
     */
    protected Class<? extends RoomAiJTester> configRoomAiJTester() {
        return null;
    }

    /**
     * 配置机器人工具
     *
     * @return RoomAiJRobot
     */
    protected Class<? extends RoomAiJRobot> configRoomAiJRobot() {
        return null;
    }

    /**
     * 配置Tio监听
     *
     * @return TioListener
     */
    @Override
    protected TioListener configTioListener() {
        return new RoomTioListener();
    }

    /**
     * 配置指令路由
     *
     * @param router router
     */
    @Override
    protected void configRouter(Router router) {
        router.addRouter(1, 1, new RoomMobileLoginEventHandler());
        router.addRouter(1, 2, new RoomEmailLoginEventHandler());
        router.addRouter(2, 1, new CreateTableEventHandler());
        router.addRouter(2, 2, new JoinTableEventHandler());
        router.addRouter(2, 3, new ChatTableEventHandler());
        router.addRouter(2, 4, new LeaveTableEventHandler());
        router.addRouter(2, 5, new ClientReadyEventHandler());
        router.addRouter(2, 6, new HeroProfileEventHandler());
        router.addRouter(2, 7, new SitDownTableEventHandler());
        router.addRouter(2, 8, new StandUpTableEventHandler());
        router.addRouter(2, 9, new DismissVoteTableEventHandler());
        configCustomRouter(router);
    }

    /**
     * 响应路由
     *
     * @param rRouter rRouter
     */
    @Override
    protected void configRRouter(RRouter rRouter) {
        rRouter.add(LoginEventResponse.class, 1, 1);
        rRouter.add(LoginNotifyResponse.class, 1, 2);
        rRouter.add(CreateTableEventResponse.class, 2, 1);
        rRouter.add(JoinTableEventResponse.class, 2, 2);
        rRouter.add(HeroEnterEventResponse.class, 2, 3);
        rRouter.add(HeroLeaveEventResponse.class, 2, 4);
        rRouter.add(HeroOnlineEventResponse.class, 2, 5);
        rRouter.add(HeroOfflineEventResponse.class, 2, 6);
        rRouter.add(HeroSitDownEventResponse.class, 2, 7);
        rRouter.add(HeroStandUpEventResponse.class, 2, 8);
        rRouter.add(HeroSceneResponse.class, 2, 9);
        rRouter.add(ChatEventResponse.class, 2, 10);
        rRouter.add(HeroProfileEventResponse.class, 2, 11);
        rRouter.add(DismissVoteEventResponse.class, 2, 12);
        configCustomRRouter(rRouter);
    }


    /**
     * 配置 serverGroupContext
     *
     * @param serverTioConfig serverTioConfig
     */
    protected void configServerTioConfig(ServerTioConfig serverTioConfig) {
        configCustomServerTioConfig(serverTioConfig);
    }

    /**
     * 初始化配置
     *
     * @param config config
     */
    @Override
    protected CoreConfig config(CoreConfig config) {
        RoomConfig roomConfig = new RoomConfig();
        roomConfig.putAll(config);
        roomConfig.setServiceType(ServiceType.ROOM);
        roomConfig.setTableAbility(configTableAbility());
        roomConfig.setDsRoom("aij-room");
        configCustomConfig(roomConfig);
        return roomConfig;
    }

    /**
     * 配置核心数据源
     *
     * @param coreDs coreDs
     * @return coreDs
     */
    @Override
    protected CoreDs configDs(CoreDs coreDs) {
        RoomDs roomDs = new RoomDs(coreDs);
        roomDs.addRoomDs(configRoomDs());   //添加游戏数据源
        configCustomDs(roomDs);
        return roomDs;
    }

    /**
     * 配置定时任务
     *
     * @param schedule schedule
     */
    @Override
    protected void configTimer(TimerSchedule schedule) {
        schedule.add(new MonitorTask(), 5 * 60 * 1000);    //5分钟监控一次
        try {
            Class<? extends RoomAiJRobot> roomAiJRobot = configRoomAiJRobot();
            if (roomAiJRobot != null)
                schedule.add(Reflection.constructor().in(roomAiJRobot).newInstance(), 2 * 1000);
        } catch (Exception e) {
            LOGGER.warn("机器人启动失败，机器人功能将无法使用！", e);
        }
    }

    /**
     * 启动完成后开始回调
     */
    @Override
    protected void onStart() {
        try {
            Class<? extends RoomAiJTester> roomTester = configRoomAiJTester();
            if (roomTester != null) Reflection.constructor().in(roomTester).newInstance().start();
        } catch (Exception e) {
            LOGGER.warn("房间测试工具启动失败，测试功能将无法使用！", e);
        }
        onRoomStart();
    }

}
