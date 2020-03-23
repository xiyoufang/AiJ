package com.xiyoufang.jfinal.zk;

import com.jfinal.kit.Prop;
import com.xiyoufang.aij.core.ServiceType;
import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.framework.state.ConnectionStateListener;
import org.apache.curator.retry.RetryOneTime;
import org.apache.curator.x.discovery.ServiceDiscovery;
import org.apache.curator.x.discovery.ServiceDiscoveryBuilder;
import org.apache.curator.x.discovery.ServiceInstance;
import org.apache.curator.x.discovery.details.JsonInstanceSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ZkPro {

    private static final Logger LOGGER = LoggerFactory.getLogger(ZkPro.class);
    /**
     * 客户端
     */
    private CuratorFramework zkClient;
    /**
     * 状态
     */
    private boolean connected;

    public ZkPro(Prop prop) {
        RetryPolicy rp = new RetryOneTime(1000);
        CuratorFrameworkFactory.Builder builder = CuratorFrameworkFactory.builder().connectString(prop.get("zk.address"))
                .connectionTimeoutMs(prop.getInt("zk.connectionTimeout"))
                .sessionTimeoutMs(prop.getInt("zk.sessionTimeout"))
                .retryPolicy(rp);
        zkClient = builder.build();
        zkClient.getConnectionStateListenable().addListener(new ConnectionStateListener() {
            @Override
            public void stateChanged(CuratorFramework curatorFramework, ConnectionState connectionState) {
                if (connectionState.isConnected()) {
                    connected = true;
                } else {
                    connected = false;
                    LOGGER.warn("zk 连接失败!");
                }
            }
        });
        zkClient.start();
    }

    public void stop() {
        zkClient.close();
    }

    /**
     * 服务发现
     *
     * @param cls      cls
     * @param basePath basePath
     * @param name     name
     * @param <T>      T
     * @return objects
     */
    public <T> List<T> discovery(Class<T> cls, String basePath, String name) {
        if (!connected) {
            throw new ServiceDiscoveryException("zk 未连接");
        }
        ServiceDiscovery<T> serviceDiscovery = ServiceDiscoveryBuilder.builder(cls).client(zkClient)
                .serializer(new JsonInstanceSerializer<T>(cls))
                .basePath(basePath)
                .build();
        try {
            serviceDiscovery.start();
            Collection<ServiceInstance<T>> services = serviceDiscovery.queryForInstances(name);
            List<T> ts = new ArrayList<>();
            for (ServiceInstance<T> instance : services) {
                ts.add(instance.getPayload());
            }
            return ts;
        } catch (Exception e) {
            LOGGER.error("cls:{},base path:{},service name:{}服务发现失败", cls, basePath, name);
            LOGGER.error("服务发现异常", e);
            throw new ServiceDiscoveryException("服务发现异常", e);
        } finally {
            try {
                serviceDiscovery.close();
            } catch (IOException ignore) {
            }
        }
    }

    /**
     * 发现所有服务
     *
     * @param cls      cls
     * @param basePath basePath
     * @return List
     */
    public <T> List<T> discovery(Class<T> cls, String basePath) {
        List<T> nodes = new ArrayList<>();
        for (ServiceType serviceType : ServiceType.values()) {
            nodes.addAll(discovery(cls, basePath, serviceType.name()));
        }
        return nodes;
    }
    
}
