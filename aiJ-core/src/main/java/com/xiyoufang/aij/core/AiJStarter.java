package com.xiyoufang.aij.core;

import com.jfinal.kit.Prop;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.IDbProFactory;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlReporter;
import com.jfinal.plugin.activerecord.dialect.Sqlite3Dialect;
import com.jfinal.plugin.druid.DruidPlugin;
import com.jfinal.template.source.ClassPathSourceFactory;
import com.xiyoufang.aij.cache.CacheProFactory;
import com.xiyoufang.aij.cache.SimpleCachePro;
import com.xiyoufang.aij.handler.HeadEventHandler;
import com.xiyoufang.aij.handler.TailEventHandler;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.response.TipsResponse;
import com.xiyoufang.aij.timer.TimerSchedule;
import com.xiyoufang.aij.utils.ClassResource;
import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.framework.state.ConnectionStateListener;
import org.apache.curator.retry.RetryOneTime;
import org.fest.reflect.core.Reflection;
import org.flywaydb.core.Flyway;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.server.ServerGroupContext;
import org.tio.server.TioServer;
import org.tio.utils.hutool.StrUtil;
import org.tio.websocket.server.WsServerStarter;

import java.io.File;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.sql.Connection;
import java.util.*;

/**
 * Created by 席有芳 on 2018-12-18.
 * AiJ启动器
 *
 * @author 席有芳
 */
public abstract class AiJStarter {

    protected final static Logger LOGGER = LoggerFactory.getLogger(AiJStarter.class);

    private WsServerStarter wsServerStarter;

    protected Prop prop = null;

    /**
     * 服务Code
     *
     * @return code
     */
    protected abstract int configServiceCode();


    /**
     * 配置服务名称
     *
     * @return service name
     */
    protected abstract String configServiceName();

    /**
     * 服务描述
     *
     * @return description
     */
    protected abstract String configServiceDescription();

    /**
     * 配置指令路由
     *
     * @param router router
     */
    protected abstract void configRouter(Router router);

    /**
     * 响应路由
     *
     * @param rRouter rRouter
     */
    protected abstract void configRRouter(RRouter rRouter);

    /**
     * 配置 serverGroupContext
     *
     * @param serverGroupContext serverGroupContext
     */
    protected abstract void configServerGroupContext(ServerGroupContext serverGroupContext);

    /**
     * 初始化配置
     *
     * @param config config
     */
    protected abstract CoreConfig config(CoreConfig config);

    /**
     * 配置核心数据源
     *
     * @param coreDs coreDs
     * @return coreDs
     */
    protected CoreDs configDs(CoreDs coreDs) {
        return coreDs;
    }

    /**
     * 配置平台数据源
     *
     * @return ds
     */
    protected abstract AiJDs configPlatformDs();

    /**
     * 配置用户中心数据源
     *
     * @return ds
     */
    protected abstract AiJDs configUserCenterDs();

    /**
     * 配置注册中
     *
     * @param registryCenter 注册中心
     */
    protected abstract void configRegistryCenter(RegistryCenter registryCenter);

    /**
     * 启动完成后开始回调
     */
    protected void onStart() {
    }

    /**
     * 开始，用于初始化
     */
    protected void onCreate() {
    }

    /**
     * 配置Tio监听
     *
     * @return TioListener
     */
    protected TioListener configTioListener() {
        return null;
    }

    /**
     * 配置定时任务
     *
     * @param schedule schedule
     */
    protected void configTimer(TimerSchedule schedule) {
    }

    /**
     * 配置缓存
     *
     * @param cacheProFactory cacheProFactory
     */
    protected void initCache(CacheProFactory cacheProFactory) {

    }

    /**
     * 创建AIJ数据源
     *
     * @param url      url
     * @param username username
     * @param password password
     * @param dialect  dialect
     * @param type     type
     * @return AiJDs
     */
    protected AiJDs createAiJDs(String url, String username, String password, String dialect, String type) {
        DruidPlugin dp = new DruidPlugin(url, username, password);
        dp.start();
        return new AiJDs(dp.getDataSource(), dialect, type);
    }

    /**
     * 加载配置
     *
     * @param resourceName resourceName
     */
    protected void loadPropertyFile(String resourceName) {
        prop = new Prop(resourceName);
    }

    /**
     * 加载配置
     *
     * @param file 文件
     */
    protected void loadPropertyFile(File file) {
        prop = new Prop(file);
    }

    /**
     * 启动
     */
    public void start() throws Exception {
        ad();
        onCreate();
        CoreConfig config = new CoreConfig();
        configDefault(config);      //初始化默认配置
        config = config(config);    //由子类自定义配置
        AiJMessageHandler wsMsgHandler = new AiJMessageHandler();
        wsServerStarter = new WsServerStarter(config.getInt(CoreConfig.WS_PORT), wsMsgHandler);
        ServerGroupContext groupContext = wsServerStarter.getServerGroupContext();
        //初始化AppConfig配置
        initAppConfig(config, groupContext);
        //初始化数据源
        CoreDs coreDs = new CoreDs();
        coreDs.addUserCenterDs(configUserCenterDs());
        coreDs.addPlatformDs(configPlatformDs());
        coreDs = configDs(coreDs);
        initDs(coreDs);
        //获取服务ID
        ServiceInfo serviceInfo = registryService();
        config.setServiceId(serviceInfo.getId());
        config.setServiceToken(serviceInfo.getToken());
        //初始化Id生成器
        Id.init();
        //初始化路由
        Router router = wsMsgHandler.router();
        configDefaultRouter(router);
        configRouter(router);
        EventFactory.init(router);
        //初始化Response Router
        RRouter rRouter = new RRouter();
        configDefaultRRouter(rRouter);
        configRRouter(rRouter);
        ResponseFactory.init(rRouter);
        //配置GroupContext
        configDefaultServerGroupContext(groupContext);
        configServerGroupContext(groupContext);
        //配置注册中心
        RegistryCenter registryCenter = new RegistryCenter();
        configDefaultRegistryCenter(registryCenter);
        configRegistryCenter(registryCenter);
        initRegistryCenter(registryCenter);
        RegistryCenterManager.init(registryCenter);
        //初始化缓存
        CacheProFactory cacheProFactory = new CacheProFactory();
        initDefaultCache(cacheProFactory);
        initCache(cacheProFactory);
        wsServerStarter.start();
        //初始化定时任务
        TimerSchedule schedule = new TimerSchedule();
        configTimer(schedule);
        schedule.start();
        onStart();
    }

    /**
     * 保存服务原信息
     */
    private ServiceInfo registryService() {
        ServiceInfo serviceInfo = new ServiceInfo();
        Record record = AiJCoreDb.platform().findFirst("select * from service s WHERE s.type = ? and s.code = ?",
                AppConfig.use().getStr(CoreConfig.SERVICE_TYPE), AppConfig.use().getInt(CoreConfig.SERVICE_CODE));
        if (record == null) {
            record = new Record().set("type", AppConfig.use().getStr(CoreConfig.SERVICE_TYPE))
                    .set("code", AppConfig.use().getInt(CoreConfig.SERVICE_CODE))
                    .set("name", AppConfig.use().getStr(CoreConfig.SERVICE_NAME))
                    .set("description", AppConfig.use().getStr(CoreConfig.SERVICE_DESCRIPTION))
                    .set("token", UUID.randomUUID().toString())
                    .set("created_time", new DateTime().toString("yyyy-MM-dd HH:mm:ss"));
            AiJCoreDb.platform().save("service", record);
        } else {
            AiJCoreDb.platform().update("service",
                    new Record().set("id", record.get("id"))
                            .set("type", AppConfig.use().getStr(CoreConfig.SERVICE_TYPE))
                            .set("code", AppConfig.use().getInt(CoreConfig.SERVICE_CODE))
                            .set("name", AppConfig.use().getStr(CoreConfig.SERVICE_NAME))
                            .set("description", AppConfig.use().getStr(CoreConfig.SERVICE_DESCRIPTION))
                            .set("modified_time", new DateTime().toString("yyyy-MM-dd HH:mm:ss")));
        }
        serviceInfo.setId(record.getInt("id"));
        serviceInfo.setDescription(record.getStr("description"));
        serviceInfo.setToken(record.getStr("token"));
        serviceInfo.setName(record.getStr("name"));
        serviceInfo.setCode(record.getInt("code"));
        serviceInfo.setType(ServiceType.valueOf(record.getStr("type")));
        return serviceInfo;
    }

    /**
     * 初始化默认缓存
     */
    private void initDefaultCache(CacheProFactory cacheProFactory) {
        cacheProFactory.registry(AppConfig.use().getStr(CoreConfig.DEFAULT_CACHE_NAME), SimpleCachePro.class, new HashMap<String, Object>());
    }

    /**
     * 默认注册中心配置
     *
     * @param registryCenter registryCenter
     */
    private void configDefaultRegistryCenter(RegistryCenter registryCenter) {
        registryCenter.setAddress("127.0.0.1:2181");
    }

    /**
     * 初始化注册中心
     *
     * @param registryCenter registryCenter
     */
    private void initRegistryCenter(final RegistryCenter registryCenter) {
        try {
            LOGGER.info("初始化注册中心,Address:{}", registryCenter.getAddress());
            RetryPolicy rp = new RetryOneTime(1000);
            CuratorFrameworkFactory.Builder builder = CuratorFrameworkFactory.builder().connectString(registryCenter.getAddress()).connectionTimeoutMs(5 * 1000).sessionTimeoutMs(20 * 1000).retryPolicy(rp);
            CuratorFramework zkClient = builder.build();
            registryCenter.setZkClient(zkClient);
            zkClient.getConnectionStateListenable().addListener(new ConnectionStateListener() {
                @Override
                public void stateChanged(CuratorFramework curatorFramework, ConnectionState connectionState) {
                    if (connectionState.isConnected()) {
                        LOGGER.info("zk 连接成功!");
                        registryCenter.setConnected(true);
                        try {
                            ServiceDetail payload = new ServiceDetail();
                            payload.setServiceId(AppConfig.use().getInt(CoreConfig.SERVICE_ID));
                            payload.setEnable(true);
                            payload.setAddress(AppConfig.use().getStr(CoreConfig.WS_PROXY_ADDRESS));
                            payload.setPort(AppConfig.use().getInt(CoreConfig.WS_PROXY_PORT));
                            payload.setServiceType(ServiceType.valueOf(AppConfig.use().getStr(CoreConfig.SERVICE_TYPE)));
                            payload.setName(AppConfig.use().getStr(CoreConfig.SERVICE_NAME));
                            payload.setServiceCode(AppConfig.use().getInt(CoreConfig.SERVICE_CODE));
                            payload.setRegistered(new Date());
                            registryCenter.registerService(payload, ServiceDetail.class);
                        } catch (Exception e) {
                            LOGGER.error("注册节点失败", e);
                        }
                    } else {
                        LOGGER.warn("zk 连接失败!");
                        registryCenter.setConnected(false);
                    }
                }
            });
            zkClient.start();
        } catch (Exception e) {
            throw new RuntimeException("初始化Zookeeper失败!", e);
        }
    }

    /**
     * 广告
     */
    private void ad() {
        String baseStr = "|----------------------------------------------------------------------------------------|";
        int baseLen = baseStr.length();
        int xxLen = 24;
        int aaLen = baseLen - 3;
        List<String> infoList = new ArrayList<>();
        infoList.add(StrUtil.fillAfter("AiJ git address", ' ', xxLen) + "| " + "https://gitee.com/xiyoufang/AiJ");
        infoList.add(StrUtil.fillAfter("AiJ site address", ' ', xxLen) + "| " + "https://www.xiyoufang.com");
        infoList.add(StrUtil.fillAfter("WeChat Official Account", ' ', xxLen) + "| " + "xiyoufang_com");
        StringBuilder printStr = new StringBuilder("\r\n" + baseStr + "\r\n");
        for (String string : infoList) {
            printStr.append("| ").append(StrUtil.fillAfter(string, ' ', aaLen)).append("|\r\n");
        }
        printStr.append(baseStr).append("\r\n");
        if (LOGGER.isInfoEnabled()) {
            LOGGER.info(printStr.toString());
        }
    }

    /**
     * 初始化默认的Response Router
     *
     * @param rRouter rRouter
     */
    private void configDefaultRRouter(RRouter rRouter) {
        rRouter.add(CommonResponse.class, 0, 0);
        rRouter.add(TipsResponse.class, 0, 1);
    }

    /**
     * 初始化数据源
     */
    private void initDs(CoreDs coreDs) {
        boolean devMode = AppConfig.use().getBool(CoreConfig.DEV_MODE);
        for (Map.Entry<String, AiJDs> entry : coreDs.getDss().entrySet()) {
            AiJDs aiJDs = entry.getValue();
            if (aiJDs != null && aiJDs.getDataSource() != null) {
                aiJDs.setName(entry.getKey());
                ActiveRecordPlugin arp = new ActiveRecordPlugin(entry.getKey(), aiJDs.getDataSource());
                SqlReporter.setLog(devMode);
                arp.setDevMode(devMode);
                arp.setDbProFactory(new IDbProFactory() {
                    @Override
                    public AiJDbPro getDbPro(String configName) {
                        return new AiJDbPro(configName);
                    }
                });
                arp.setShowSql(devMode);
                arp.setDialect(aiJDs.getDialect());
                if (arp.getConfig().getDialect() instanceof Sqlite3Dialect) {
                    arp.setTransactionLevel(Connection.TRANSACTION_SERIALIZABLE);   //SQLITE事物隔离级别
                }
                arp.setBaseSqlTemplatePath(aiJDs.getSqlPath());
                arp.getEngine().setSourceFactory(new ClassPathSourceFactory());
                if (ClassResource.exist(ClassResource.buildFinalFileName(aiJDs.getSqlPath(), "core.sql"))) {
                    arp.addSqlTemplate("core.sql"); //约定的东西
                }
                if (ClassResource.exist(ClassResource.buildFinalFileName(aiJDs.getSqlPath(), "all.sql"))) {
                    arp.addSqlTemplate("all.sql"); //约定的东西
                }
                if (aiJDs.getContainerFactory() != null) {
                    arp.setContainerFactory(aiJDs.getContainerFactory());
                }
                arp.start();
                Flyway flyway = Flyway.configure().dataSource(aiJDs.getDataSource())
                        .table(aiJDs.getTable())
                        .locations(aiJDs.getLocation())
                        .baselineOnMigrate(true).load();
                flyway.migrate();
            }
        }
    }

    /**
     * 配置
     *
     * @param config config
     */
    private void configDefault(CoreConfig config) {
        config.setWsPort(8081);
        config.setWsAddress(getLocalHostLANAddress().getHostAddress());
        config.setWsProxyPort(config.getInt(CoreConfig.WS_PORT));
        config.setWsProxyAddress(config.getStr(CoreConfig.WS_ADDRESS));
        config.setServiceCode(configServiceCode());
        config.setServiceName(configServiceName());
        config.setServiceDescription(configServiceDescription());
        config.setDefaultCacheName("aij_simple_cache");
        config.setRegisterPath("/aij/service");
        config.setDsUserCenter("aij-users");
        config.setDsPlatform("aij-platform");
    }


    /**
     * 默认路由
     *
     * @param router router
     */
    private void configDefaultRouter(Router router) {
        router.beforeRouter(new HeadEventHandler());
        router.afterRouter(new TailEventHandler());
    }

    /**
     * 配置serverGroupContext的默认属性
     *
     * @param serverGroupContext serverGroupContext
     */
    private void configDefaultServerGroupContext(ServerGroupContext serverGroupContext) {
        AiJMessageListener aioListener = new AiJMessageListener();
        aioListener.setTioListener(configTioListener());
        serverGroupContext.setServerAioListener(aioListener);
    }

    /**
     * 初始化AppConfig
     */
    private void initAppConfig(Config config, ServerGroupContext groupContext) {
        AppConfig.init(config, groupContext);
    }

    /**
     * 获取本机IP
     *
     * @return InetAddress
     */
    public InetAddress getLocalHostLANAddress() {
        try {
            InetAddress candidateAddress = null;
            // 遍历所有的网络接口
            for (Enumeration ifaces = NetworkInterface.getNetworkInterfaces(); ifaces.hasMoreElements(); ) {
                NetworkInterface iface = (NetworkInterface) ifaces.nextElement();
                // 在所有的接口下再遍历IP
                for (Enumeration inetAddrs = iface.getInetAddresses(); inetAddrs.hasMoreElements(); ) {
                    InetAddress inetAddr = (InetAddress) inetAddrs.nextElement();
                    if (!inetAddr.isLoopbackAddress()) {// 排除loopback类型地址
                        if (inetAddr.isSiteLocalAddress()) {
                            // 如果是site-local地址，就是它了
                            return inetAddr;
                        } else if (candidateAddress == null) {
                            // site-local类型的地址未被发现，先记录候选地址
                            candidateAddress = inetAddr;
                        }
                    }
                }
            }
            if (candidateAddress != null) {
                return candidateAddress;
            }
            // 如果没有发现 non-loopback地址.只能用最次选的方案
            return InetAddress.getLocalHost();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 停止
     */
    public void stop() {
        Reflection.field("tioServer").ofType(TioServer.class).in(wsServerStarter).get().stop();
    }

}
