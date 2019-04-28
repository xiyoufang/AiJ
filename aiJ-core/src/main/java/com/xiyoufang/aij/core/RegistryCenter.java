package com.xiyoufang.aij.core;

import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.x.discovery.ServiceDiscovery;
import org.apache.curator.x.discovery.ServiceDiscoveryBuilder;
import org.apache.curator.x.discovery.ServiceInstance;
import org.apache.curator.x.discovery.ServiceInstanceBuilder;
import org.apache.curator.x.discovery.details.JsonInstanceSerializer;

/**
 * Created by 席有芳 on 2018-12-23.
 *
 * @author 席有芳
 */
public class RegistryCenter {

    /**
     * address
     */
    private String address;
    /**
     * zK客户端
     */
    private CuratorFramework zkClient;
    /**
     * 连接
     */
    private boolean connected;

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAddress() {
        return address;
    }

    public CuratorFramework getZkClient() {
        return zkClient;
    }

    void setZkClient(CuratorFramework zkClient) {
        this.zkClient = zkClient;
    }

    /**
     * 服务注册
     *
     * @param payload payload
     * @param cls     cls
     * @param <T>     T
     * @throws Exception Exception
     */
    public <T> void registerService(T payload, Class<T> cls) throws Exception {
        ServiceDiscovery<T> discovery = serviceDiscovery(cls);
        discovery.registerService(serviceInstance(payload, cls));
        discovery.start();
    }

    /**
     * 服务更新
     *
     * @param payload payload
     * @param cls     cls
     * @param <T>     T
     * @throws Exception Exception
     */
    public <T> void updateService(T payload, Class<T> cls) throws Exception {
        ServiceDiscovery<T> discovery = serviceDiscovery(cls);
        discovery.updateService(serviceInstance(payload, cls));
        discovery.start();
    }

    /**
     * 获取服务实例
     *
     * @param payload payload
     * @param cls     cls
     * @param <T>     T
     * @return ServiceInstance
     * @throws Exception Exception
     */
    private <T> ServiceInstance<T> serviceInstance(T payload, Class<T> cls) throws Exception {
        ServiceInstanceBuilder<T> sib = ServiceInstance.builder();
        sib.address(AppConfig.use().getStr(CoreConfig.WS_ADDRESS));
        sib.port(AppConfig.use().getInt(CoreConfig.WS_PORT));
        sib.enabled(true);
        sib.name(AppConfig.use().getStr(CoreConfig.SERVICE_TYPE));
        sib.payload(payload);
        return sib.build();
    }

    /**
     * 服务发现
     *
     * @param cls cls
     * @param <T> T
     * @return ServiceDiscovery
     */
    public <T> ServiceDiscovery<T> serviceDiscovery(Class<T> cls) {
        return serviceDiscovery(cls, AppConfig.use().getStr(CoreConfig.REGISTER_PATH));
    }


    /**
     * 服务发现
     *
     * @param cls      cls
     * @param basePath basePath
     * @param <T>      T
     * @return ServiceDiscovery
     */
    public <T> ServiceDiscovery<T> serviceDiscovery(Class<T> cls, String basePath) {
        return ServiceDiscoveryBuilder.builder(cls)
                .client(zkClient)
                .serializer(new JsonInstanceSerializer<T>(cls))
                .basePath(basePath)
                .build();
    }

    public boolean isConnected() {
        return connected;
    }

    void setConnected(boolean connected) {
        this.connected = connected;
    }
}
