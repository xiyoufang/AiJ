package com.xiyoufang.aij.mahjong;

import com.xiyoufang.aij.core.AiJDs;
import com.xiyoufang.aij.core.RRouter;
import com.xiyoufang.aij.core.RegistryCenter;
import com.xiyoufang.aij.core.Router;
import com.xiyoufang.aij.mahjong.handler.OperateEventHandler;
import com.xiyoufang.aij.mahjong.handler.OutCardEventHandler;
import com.xiyoufang.aij.mahjong.response.*;
import com.xiyoufang.aij.room.RoomAiJStarter;
import com.xiyoufang.aij.room.config.RoomConfig;
import com.xiyoufang.aij.room.config.RoomDs;
import com.xiyoufang.aij.room.table.TableAbility;
import com.xiyoufang.aij.room.tester.RoomAiJTester;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.server.ServerTioConfig;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class MahjongRoomAiJStarter extends RoomAiJStarter {

    private final static Logger LOGGER = LoggerFactory.getLogger(MahjongRoomAiJStarter.class);

    /**
     * 配置 configTableAbility
     *
     * @return TableAbility
     */
    @Override
    protected Class<? extends TableAbility> configTableAbility() {
        return MahjongTableAbility.class;
    }

    /*
     * 配置测试工具
     *
     * @return AbstractRoomTester
     */
    @Override
    protected Class<? extends RoomAiJTester> configRoomAiJTester() {
        return MahjongRoomAiJTester.class;
    }


    /**
     * 服务Code
     *
     * @return code
     */
    @Override
    protected int configServiceCode() {
        return 200001;
    }

    /**
     * 配置节点名称
     *
     * @return service name
     */
    @Override
    protected String configNodeName() {
        return "南丰麻将";
    }

    /**
     * 服务描述
     *
     * @return description
     */
    @Override
    protected String configNodeDescription() {
        return "南丰麻将服务器";
    }

    /**
     * 配置平台数据源
     *
     * @return ds
     */
    @Override
    protected AiJDs configPlatformDs() {
        return createAiJDs(prop.get("db.platform.url"), prop.get("db.platform.username"), prop.get("db.platform.password"), prop.get("db.platform.dialect"), prop.get("db.platform.type"));
    }

    /**
     * 配置用户中心数据源
     *
     * @return ds
     */
    @Override
    protected AiJDs configUserCenterDs() {
        return createAiJDs(prop.get("db.users.url"), prop.get("db.users.username"), prop.get("db.users.password"), prop.get("db.users.dialect"), prop.get("db.users.type"));
    }

    /**
     * 添加游戏数据源
     *
     * @return DataSource
     */
    @Override
    protected AiJDs configRoomDs() {
        return createAiJDs(prop.get("db.room.url"), prop.get("db.room.username"), prop.get("db.room.password"), prop.get("db.room.dialect"), prop.get("db.room.type"));
    }

    /**
     * 配置自定义数据源
     *
     * @param ds ds
     */
    @Override
    protected void configCustomDs(RoomDs ds) {
        ds.add(MahjongConfig.DS_MAHJONG, createAiJDs(prop.get("db.mahjong.url"), prop.get("db.mahjong.username"), prop.get("db.mahjong.password"), prop.get("db.mahjong.dialect"), prop.get("db.mahjong.type")));
    }

    /**
     * 配置注册中
     *
     * @param registryCenter 注册中心
     */
    @Override
    protected void configRegistryCenter(RegistryCenter registryCenter) {
    }


    /**
     * 配置自定义 serverTioConfig
     *
     * @param serverTioConfig serverTioConfig
     */
    @Override
    protected void configCustomServerTioConfig(ServerTioConfig serverTioConfig) {

    }

    /**
     * 配置自定义指令路由
     *
     * @param router router
     */
    @Override
    protected void configCustomRouter(Router router) {
        router.addRouter(8, 0, new OutCardEventHandler());
        router.addRouter(8, 1, new OperateEventHandler());
    }

    /**
     * 配置自定义Response路由
     *
     * @param rRouter rRouter
     */
    @Override
    protected void configCustomRRouter(RRouter rRouter) {
        rRouter.add(ErrorEventResponse.class, 8, -1);           //错误
        rRouter.add(GameStartEventResponse.class, 8, 0);        //开始游戏映射
        rRouter.add(DispatchCardEventResponse.class, 8, 1);     //发牌
        rRouter.add(OutCardEventResponse.class, 8, 2);          //出牌事件
        rRouter.add(OperateNotifyEventResponse.class, 8, 3);    //通知事件
        rRouter.add(OperateResultEventResponse.class, 8, 4);    //结果事件
        rRouter.add(GameStatusResponse.class, 8, 5);            //当前游戏状态
        rRouter.add(PlayingGameSceneResponse.class, 8, 6);      //当前游戏进行中场景
        rRouter.add(PrepareGameSceneResponse.class, 8, 7);      //当前游戏预备场景
        rRouter.add(GameEndEventResponse.class, 8, 8);          //游戏结束
        rRouter.add(EndEventResponse.class, 8, 9);              //桌子结束
    }

    /**
     * 初始化自定义配置
     *
     * @param config config
     */
    @Override
    protected void configCustomConfig(RoomConfig config) {
        config.setDevMode(true);
        config.setEnableAndroid(true); //激活机器人
    }

    /**
     * 房间启动回调
     */
    @Override
    protected void onRoomStart() {
        LOGGER.info("房间启动完成");
    }

    /**
     * 开始，用于初始化
     */
    @Override
    protected void onCreate() {
        loadPropertyFile("mahjong_config.properties");
    }

    public static void main(String[] args) throws Exception {
        new MahjongRoomAiJStarter().start();
    }

}
