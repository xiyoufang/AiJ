package com.xiyoufang.aij.core;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class CoreConfig extends Config {
    /**
     * 端口
     */
    public static final String WS_PORT = "$port";
    /**
     * 地址
     */
    public static final String WS_ADDRESS = "$address";
    /**
     * 代理端口
     */
    public static final String WS_PROXY_PORT = "$ws_proxy_port";
    /**
     * 代理ip
     */
    public static final String WS_PROXY_ADDRESS = "$ws_proxy_address";
    /**
     * 服务名称
     */
    public static final String SERVICE_NAME = "$service_name";
    /**
     * 服务描述
     */
    public static final String SERVICE_DESCRIPTION = "$service_description";
    /**
     * 服务图标
     */
    public static final String SERVICE_ICON = "$service_icon";
    /**
     * 服务部署地址
     */
    public static final String SERVICE_DEPLOYMENT = "$service_deployment";
    /**
     * 服务排序
     */
    public static final String SERVICE_SORT = "$service_sort";
    /**
     * 节点名称
     */
    public static final String NODE_NAME = "$node_name";
    /**
     * 节点描述
     */
    public static final String NODE_DESCRIPTION = "$node_description";
    /**
     * 用户中心数据源
     */
    public static final String DS_USER_CENTER = "$ds_user_center";
    /**
     * 平台数据源
     */
    public static final String DS_PLATFORM = "$ds_platform";
    /**
     * 开发模式
     */
    public static final String DEV_MODE = "$dev_mode";
    /**
     * 服务类型
     */
    public static final String SERVICE_TYPE = "$service_type";
    /**
     * 服务Code
     */
    public static final String SERVICE_CODE = "$service_code";
    /**
     * 服务ID
     */
    public static final String SERVICE_ID = "$service_id";
    /**
     * 服务Token
     */
    public static final String NODE_TOKEN = "$node_token";
    /**
     * 服务器注册路径
     */
    public static final String REGISTER_PATH = "$register_path";
    /**
     * 缓存名称
     */
    public static final String DEFAULT_CACHE_NAME = "$default_cache_name";

    /**
     * 微信app ID
     */
    public static final String WX_APP_ID = "$wx_app_id";
    /**
     * 微信secret
     */
    public static final String WX_SECRET = "$wx_secret";

    public CoreConfig() {
    }

    public CoreConfig(Config config) {
        putAll(config);
    }

    public void setWsPort(int port) {
        setInt(WS_PORT, port);
    }

    /**
     * 代理端口
     *
     * @param port port
     */
    public void setWsProxyPort(int port) {
        setInt(WS_PROXY_PORT, port);
    }

    /**
     * WS访问地址
     *
     * @param address address
     */
    public void setWsAddress(String address) {
        setStr(WS_ADDRESS, address);
    }

    /**
     * 代理地址
     *
     * @param address address
     */
    public void setWsProxyAddress(String address) {
        setStr(WS_PROXY_ADDRESS, address);
    }

    /**
     * 用户中心数据源名称
     *
     * @param dsName dsName
     */
    public void setDsUserCenter(String dsName) {
        setStr(DS_USER_CENTER, dsName);
    }


    /**
     * 平台数据源名称
     *
     * @param dsName dsName
     */
    public void setDsPlatform(String dsName) {
        setStr(DS_PLATFORM, dsName);
    }

    /**
     * 开发模式
     *
     * @param b b
     */
    public void setDevMode(boolean b) {
        setBool(DEV_MODE, b);
    }

    /**
     * 服务类型
     *
     * @param serviceType serviceType
     */
    public void setServiceType(ServiceType serviceType) {
        setStr(SERVICE_TYPE, serviceType.name());
    }

    /**
     * 服务名称
     *
     * @param name name
     */
    public void setServiceName(String name) {
        setStr(SERVICE_NAME, name);
    }

    /**
     * 节点名称
     *
     * @param name name
     */
    public void setNodeName(String name) {
        setStr(NODE_NAME, name);
    }

    /**
     * 服务ID
     *
     * @param serviceId serviceId
     */
    public void setServiceId(int serviceId) {
        setInt(SERVICE_ID, serviceId);
    }

    /**
     * 服务Code
     *
     * @param serviceCode serviceCode
     */
    public void setServiceCode(int serviceCode) {
        setInt(SERVICE_CODE, serviceCode);
    }

    /**
     * 服务Token
     *
     * @param token token
     */
    public void setNodeToken(String token) {
        setStr(NODE_TOKEN, token);
    }

    /**
     * 设置服务描述
     *
     * @param description description
     */
    public void setServiceDescription(String description) {
        setStr(SERVICE_DESCRIPTION, description);
    }

    /**
     * 设置图标
     *
     * @param icon icon
     */
    public void setServiceIcon(String icon) {
        setStr(SERVICE_ICON, icon);
    }

    /**
     * 设置部署地址
     *
     * @param deployment deployment
     */
    public void setServiceDeployment(String deployment) {
        setStr(SERVICE_DEPLOYMENT, deployment);
    }

    /**
     * 设置排序
     *
     * @param sort sort
     */
    public void setServiceSort(int sort) {
        setInt(SERVICE_SORT, sort);
    }

    /**
     * 设置节点描述
     *
     * @param description description
     */
    public void setNodeDescription(String description) {
        setStr(NODE_DESCRIPTION, description);
    }

    /**
     * 服务注册路径
     *
     * @param path path
     */
    public void setRegisterPath(String path) {
        setStr(REGISTER_PATH, path);
    }

    /**
     * 缓存名称
     *
     * @param cacheName cacheName
     */
    public void setDefaultCacheName(String cacheName) {
        setStr(DEFAULT_CACHE_NAME, cacheName);
    }

    /**
     * 设置微信APP ID
     *
     * @param wxAppId wxAppId
     */
    public void setWxAppId(String wxAppId) {
        setStr(WX_APP_ID, wxAppId);
    }

    /**
     * 设置微信Secret
     *
     * @param wxSecret wxSecret
     */
    public void setWxSecret(String wxSecret) {
        setStr(WX_SECRET, wxSecret);
    }
}
