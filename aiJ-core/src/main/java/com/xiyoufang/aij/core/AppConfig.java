package com.xiyoufang.aij.core;

import com.jfinal.kit.StrKit;
import org.tio.core.TioConfig;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-19.
 * 应用配置
 *
 * @author 席有芳
 */
public class AppConfig {

    /**
     * 默认编码
     */
    private static final String DEFAULT_CHARSET = "UTF-8";
    /**
     * 编码
     */
    private String charset = DEFAULT_CHARSET;
    /**
     * 配置
     */
    private Config config = new Config();
    /**
     * Context
     */
    private TioConfig tioConfig;
    /**
     * AppConfig
     */
    private static Map<String, AppConfig> instances = new HashMap<>();
    /**
     * instances
     */
    private static AppConfig defaultInstance;

    /**
     * 初始化
     *
     * @param config       config
     * @param tioConfig tioConfig
     */
    public static synchronized void init(Config config, TioConfig tioConfig) {
        String name = tioConfig.getName();
        if (StrKit.isBlank(name)) {
            throw new RuntimeException("GroupContext名称不能为空");
        }
        if (instances.get(name) != null) {
            throw new RuntimeException("已经存在同名的GroupContext");
        }
        AppConfig appConfig = new AppConfig();
        appConfig.tioConfig = tioConfig;
        appConfig.config = config;
        if (instances.size() == 0) {
            AppConfig.defaultInstance = appConfig;
        }
        instances.put(name, appConfig);
    }

    public static AppConfig use() {
        return defaultInstance;
    }

    public static AppConfig use(String name) {
        return instances.get(name);
    }

    public String getCharset() {
        return charset;
    }

    public void setCharset(String charset) {
        this.charset = charset;
    }

    public boolean yes(String key) {
        return config.yes(key);
    }

    public int getInt(String key) {
        return config.getInt(key);
    }

    public String getStr(String key) {
        return config.getStr(key);
    }

    public <T> Class<T> getClass(String key, Class<T> cls) throws ClassNotFoundException {
        return config.getClass(key, cls);
    }

    public Config getConfig() {
        return config;
    }

    public TioConfig getTioConfig() {
        return tioConfig;
    }

    public boolean getBool(String key) {
        return config.getBool(key);
    }
}
