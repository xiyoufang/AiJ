package com.xiyoufang.aij.circle;

import com.xiyoufang.aij.core.*;
import org.tio.server.ServerGroupContext;

/**
 * Created by 席有芳 on 2019-02-02.
 *
 * @author 席有芳
 */
public class CircleAiJStarter extends AiJStarter {
    /**
     * 服务Code
     *
     * @return code
     */
    @Override
    protected int configServiceCode() {
        return 100003;
    }

    /**
     * 配置服务名称
     *
     * @return service name
     */
    @Override
    protected String configServiceName() {
        return "亲友圈";
    }

    /**
     * 服务描述
     *
     * @return description
     */
    @Override
    protected String configServiceDescription() {
        return "亲友圈服务器";
    }

    /**
     * 配置指令路由
     *
     * @param router router
     */
    @Override
    protected void configRouter(Router router) {

    }

    /**
     * 响应路由
     *
     * @param rRouter rRouter
     */
    @Override
    protected void configRRouter(RRouter rRouter) {

    }

    /**
     * 配置 serverGroupContext
     *
     * @param serverGroupContext serverGroupContext
     */
    @Override
    protected void configServerGroupContext(ServerGroupContext serverGroupContext) {

    }

    /**
     * 初始化配置
     *
     * @param config config
     */
    @Override
    protected CoreConfig config(CoreConfig config) {
        config.setServiceType(ServiceType.CIRCLE);
        config.setDevMode(true);
        config.setWsPort(8083);
        return config;
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
     * 启动完成后开始回调
     */
    @Override
    protected void onStart() {

    }

    /**
     * 开始，用于初始化
     */
    @Override
    protected void onCreate() {
        loadPropertyFile("circle_config.properties");
    }

    public static void main(String[] args) throws Exception {
        new CircleAiJStarter().start();
    }

}
