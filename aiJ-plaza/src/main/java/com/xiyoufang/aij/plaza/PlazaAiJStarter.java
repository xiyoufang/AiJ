package com.xiyoufang.aij.plaza;

import com.xiyoufang.aij.core.*;
import com.xiyoufang.aij.plaza.config.PlazaConfig;
import com.xiyoufang.aij.plaza.handler.*;
import com.xiyoufang.aij.plaza.response.*;
import org.tio.server.ServerTioConfig;

/**
 * Created by 席有芳 on 2018-12-26.
 * 游戏大厅服务
 *
 * @author 席有芳
 */
public class PlazaAiJStarter extends AiJStarter {

    /**
     * 服务Code
     *
     * @return code
     */
    @Override
    protected int configServiceCode() {
        return 100002;
    }

    /**
     * 配置服务名称
     *
     * @return service name
     */
    @Override
    protected String configNodeName() {
        return "游戏大厅";
    }

    /**
     * 服务描述
     *
     * @return description
     */
    @Override
    protected String configNodeDescription() {
        return "游戏大厅服务";
    }

    /**
     * 配置指令路由
     *
     * @param router router
     */
    @Override
    protected void configRouter(Router router) {
        router.addRouter(1, 1, new PlazaMobileLoginEventHandler());
        router.addRouter(1, 2, new PlazaEmailLoginEventHandler());
        router.addRouter(1, 3, new PlazaWeiXinLoginEventHandler());
        router.addRouter(2, 1, new NoticeEventHandler());
        router.addRouter(2, 2, new BroadcastEventHandler());
        router.addRouter(3, 1, new RoomServiceEventHandler());
        router.addRouter(3, 2, new RoomRecordEventHandler());
        router.addRouter(4, 1, new UserAssetEventHandler());
        router.addRouter(4, 2, new UserAssetTransEventHandler());
        router.addRouter(4, 3, new RechargeRecordEventHandler());
        router.addRouter(4, 4, new UserCertEventHandler());
    }

    /**
     * 响应路由
     *
     * @param rRouter rRouter
     */
    @Override
    protected void configRRouter(RRouter rRouter) {
        rRouter.add(LoginEventResponse.class, 1, 1);
        rRouter.add(NoticeEventResponse.class, 2, 1);
        rRouter.add(BroadcastEventResponse.class, 2, 2);
        rRouter.add(RoomServiceEventResponse.class, 3, 1);
        rRouter.add(RoomRecordEventResponse.class, 3, 2);
        rRouter.add(UserAssetEventResponse.class, 4, 1);
        rRouter.add(UserAssetTransEventResponse.class, 4, 2);
        rRouter.add(RechargeRecordEventResponse.class, 4, 3);
        rRouter.add(UserCertEventResponse.class, 4, 4);
    }

    /**
     * 配置 serverTioConfig
     *
     * @param serverTioConfig serverTioConfig
     */
    @Override
    protected void configServerTioConfig(ServerTioConfig serverTioConfig) {

    }

    /**
     * 初始化配置
     *
     * @param config config
     */
    @Override
    protected CoreConfig config(CoreConfig config) {
        PlazaConfig plazaConfig = new PlazaConfig(config);
        plazaConfig.setServiceType(ServiceType.PLAZA);
        plazaConfig.setDevMode(true);
        plazaConfig.setWsPort(8082);
        plazaConfig.setDsRoom("aij-room");
        return plazaConfig;
    }

    /**
     * 配置核心数据源
     *
     * @param coreDs coreDs
     * @return coreDs
     */
    @Override
    protected CoreDs configDs(CoreDs coreDs) {
        coreDs.add(AppConfig.use().getStr(PlazaConfig.DS_ROOM), createAiJDs(prop.get("db.room.url"), prop.get("db.room.username"), prop.get("db.room.password"), prop.get("db.room.dialect"), prop.get("db.room.type")));
        return coreDs;
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
     * 配置注册中
     *
     * @param registryCenter 注册中心
     */
    @Override
    protected void configRegistryCenter(RegistryCenter registryCenter) {

    }

    /**
     * 开始，用于初始化
     */
    @Override
    protected void onCreate() {
        loadPropertyFile("plaza_config.properties");
    }

    /**
     * 启动完成后开始回调
     */
    @Override
    protected void onStart() {
        LOGGER.info("服务启动完成!");
    }


    public static void main(String[] args) throws Exception {
        new PlazaAiJStarter().start();
    }
}
