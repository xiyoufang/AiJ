package com.xiyoufang.aij.core;

import com.jfinal.kit.Prop;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlReporter;
import com.jfinal.plugin.activerecord.dialect.Sqlite3Dialect;
import com.jfinal.plugin.druid.DruidPlugin;
import com.jfinal.template.Engine;
import com.jfinal.template.source.ClassPathSource;
import com.jfinal.template.source.ClassPathSourceFactory;
import com.jfinal.template.source.ISource;
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
import org.apache.curator.retry.RetryForever;
import org.fest.reflect.core.Reflection;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.server.ServerTioConfig;
import org.tio.server.TioServer;
import org.tio.utils.hutool.StrUtil;
import org.tio.websocket.server.WsServerStarter;

import java.io.File;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.sql.Connection;
import java.text.MessageFormat;
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
     * 配置节点名称
     *
     * @return node name
     */
    protected abstract String configNodeName();

    /**
     * 节点描述
     *
     * @return description
     */
    protected abstract String configNodeDescription();

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
     * 配置 serverTioConfig
     *
     * @param serverTioConfig serverTioConfig
     */
    protected abstract void configServerTioConfig(ServerTioConfig serverTioConfig);

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
        config = initCoreConfig(config);      //初始化默认配置
        AiJMessageHandler wsMsgHandler = new AiJMessageHandler();
        wsServerStarter = new WsServerStarter(config.getInt(CoreConfig.WS_PORT), wsMsgHandler);
        ServerTioConfig serverTioConfig = wsServerStarter.getServerTioConfig();
        //初始化AppConfig配置
        initAppConfig(config, serverTioConfig);
        //初始化数据源
        CoreDs coreDs = new CoreDs();
        coreDs.addUserCenterDs(configUserCenterDs());
        coreDs.addPlatformDs(configPlatformDs());
        coreDs = configDs(coreDs);
        initDs(coreDs);
        //获取服务ID
        ServiceInfo serviceInfo = registryService();
        config.setServiceId(serviceInfo.getId());
        config.setServiceName(serviceInfo.getName());
        config.setServiceDescription(serviceInfo.getDescription());
        config.setServiceIcon(serviceInfo.getIcon());
        config.setServiceDeployment(serviceInfo.getDeployment());
        config.setServiceSort(serviceInfo.getSort());
        config.setNodeToken(UUID.randomUUID().toString());
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
        //配置ServerTioConfig
        configDefaultServerTioConfig(serverTioConfig);
        configServerTioConfig(serverTioConfig);
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
        int serviceCode = AppConfig.use().getInt(CoreConfig.SERVICE_CODE);
        String serviceType = AppConfig.use().getStr(CoreConfig.SERVICE_TYPE);
        Record record = AiJCoreDb.platform().findByUnique("service", "type, code", serviceType, serviceCode);
        if (record == null) {
            String message = MessageFormat.format("CODE为:{0}的{1}服务，没有在数据库中添加，请校验service表是否存在对应的服务信息", serviceCode, serviceType);
            LOGGER.error(message);
            throw new RuntimeException(message);
        }
        serviceInfo.setId(record.getInt("id"));
        serviceInfo.setDescription(record.getStr("description"));
        serviceInfo.setName(record.getStr("name"));
        serviceInfo.setCode(record.getInt("code"));
        serviceInfo.setType(ServiceType.valueOf(record.getStr("type")));
        serviceInfo.setIcon(record.getStr("icon"));
        serviceInfo.setDeployment(record.getStr("deployment"));
        serviceInfo.setSort(record.getInt("sort"));
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
            RetryPolicy rp = new RetryForever(10 * 1000);   // 每隔10秒检测Zk的连接状态
            CuratorFrameworkFactory.Builder builder = CuratorFrameworkFactory.builder().connectString(registryCenter.getAddress())
                    .connectionTimeoutMs(5 * 1000)
                    .sessionTimeoutMs(60 * 1000).retryPolicy(rp);
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
                            payload.setServiceCode(AppConfig.use().getInt(CoreConfig.SERVICE_CODE));
                            payload.setServiceName(AppConfig.use().getStr(CoreConfig.SERVICE_NAME));
                            payload.setServiceDescription(AppConfig.use().getStr(CoreConfig.SERVICE_DESCRIPTION));
                            payload.setServiceIcon(AppConfig.use().getStr(CoreConfig.SERVICE_ICON));
                            payload.setServiceDeployment(AppConfig.use().getStr(CoreConfig.SERVICE_DEPLOYMENT));
                            payload.setServiceSort(AppConfig.use().getInt(CoreConfig.SERVICE_SORT));
                            payload.setNodeName(AppConfig.use().getStr(CoreConfig.NODE_NAME));
                            payload.setNodeDescription(AppConfig.use().getStr(CoreConfig.NODE_DESCRIPTION));
                            payload.setNodeToken(AppConfig.use().getStr(CoreConfig.NODE_TOKEN));
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
                arp.setDbProFactory(AiJDbPro::new);
                arp.setShowSql(devMode);
                arp.setDialect(aiJDs.getDialect());
                if (arp.getConfig().getDialect() instanceof Sqlite3Dialect) {
                    arp.setTransactionLevel(Connection.TRANSACTION_SERIALIZABLE);   //SQLITE事物隔离级别
                }
                arp.setBaseSqlTemplatePath(aiJDs.getSqlPath());
                Engine engine = arp.getEngine();
                engine.addSharedObject("StrKit", new StrKit());
                engine.setSourceFactory(new ClassPathSourceFactory() {
                    @Override
                    public ISource getSource(String baseTemplatePath, String fileName, String encoding) {
                        return new ClassPathSource(baseTemplatePath, fileName, encoding) {
                            @Override
                            public boolean isModified() {
                                return devMode; //开发模式热更新
                            }
                        };
                    }
                });
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
                try {
                    flyway.migrate();
                } catch (FlywayException e) {
                    if (devMode) {
                        LOGGER.warn("开发过程中初始化SQL执行错误不处理，手动维护", e);
                    } else {
                        throw e;
                    }
                }
            }
        }
    }

    /**
     * 配置
     *
     * @param config config
     */
    private CoreConfig initCoreConfig(CoreConfig config) {
        config.setWsPort(8081);
        config.setWsAddress(getLocalHostLANAddress().getHostAddress());
        config.setServiceCode(configServiceCode());
        config.setNodeName(configNodeName());
        config.setNodeDescription(configNodeDescription());
        config.setDefaultCacheName("aij_simple_cache");
        config.setRegisterPath("/aij/service");
        config.setDsUserCenter("aij-users");
        config.setDsPlatform("aij-platform");
        config.setWxAppId("wx7da1c028a41aeaf3");
        config.setWxSecret("61fca66cdaf99017bbd2f78c4393b84a");
        config = config(config);    //由子类自定义配置
        if (config.get(CoreConfig.WS_PROXY_PORT) == null) {
            config.setWsProxyPort(config.getInt(CoreConfig.WS_PORT));
        }
        if (config.get(CoreConfig.WS_PROXY_ADDRESS) == null) {
            config.setWsProxyAddress(config.getStr(CoreConfig.WS_ADDRESS));
        }
        return config;
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
     * @param serverTioConfig serverTioConfig
     */
    private void configDefaultServerTioConfig(ServerTioConfig serverTioConfig) {
        AiJMessageListener aioListener = new AiJMessageListener();
        aioListener.setTioListener(configTioListener());
        serverTioConfig.setServerAioListener(aioListener);
    }

    /**
     * 初始化AppConfig
     */
    private void initAppConfig(Config config, ServerTioConfig serverTioConfig) {
        AppConfig.init(config, serverTioConfig);
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
