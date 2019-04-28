package com.xiyoufang.jfinal.zk;

import com.jfinal.kit.Prop;
import com.jfinal.plugin.IPlugin;
import org.apache.curator.RetryPolicy;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.state.ConnectionState;
import org.apache.curator.framework.state.ConnectionStateListener;
import org.apache.curator.retry.RetryOneTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ZkPlugin implements IPlugin {
    /**
     * 日志
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(ZkPlugin.class);
    /**
     * 配置
     */
    private Prop prop;
    /**
     * 客户端
     */
    private ZkPro zkPro;
    /**
     * zkPros
     */
    private Map<String, ZkPro> zkPros = new HashMap<>();
    /**
     * 默认的名称
     */
    final static String DEFAULT_NAME = "MAIN";
    /**
     * Name
     */
    private String name;

    public ZkPlugin(String fileName) {
        this(DEFAULT_NAME, fileName);
    }

    public ZkPlugin(String name, String fileName) {
        this.name = name;
        this.prop = new Prop(fileName);
    }

    @Override
    public boolean start() {
        ZkKit.init(name, prop);
        return true;
    }

    @Override
    public boolean stop() {
        for (ZkPro pro : ZkKit.zkPros.values()) {
            pro.stop();
        }
        return true;
    }
}
