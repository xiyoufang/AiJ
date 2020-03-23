package com.xiyoufang.aij.platform;

import com.jfinal.config.*;
import com.jfinal.ext.handler.ContextPathHandler;
import com.jfinal.json.FastJsonFactory;
import com.jfinal.template.Engine;
import com.jfinal.template.ext.directive.RandomDirective;
import com.xiyoufang.aij.platform.controller.*;
import com.xiyoufang.jfinal.directive.VersionDirective;
import com.xiyoufang.jfinal.handler.AllowCrossHandler;
import com.xiyoufang.jfinal.handler.TrimParameterHandler;
import com.xiyoufang.jfinal.handler.UrlFilterHandler;
import com.xiyoufang.jfinal.shiro.ShiroInterceptor;
import com.xiyoufang.jfinal.zk.ZkPlugin;

/**
 * Created by 席有芳 on 2018-12-26.
 *
 * @author 席有芳
 */
public class AiJPlatformConfig extends JFinalConfig {

    AiJPlatformStarter aiJPlatformStarter;

    /**
     * Config constant
     *
     * @param me me
     */
    @Override
    public void configConstant(Constants me) {
        loadPropertyFile("main.properties");
        me.setDevMode(getPropertyToBoolean("platform.devMode"));
        me.setJsonFactory(new FastJsonFactory());
    }

    /**
     * Config route
     *
     * @param me me
     */
    @Override
    public void configRoute(Routes me) {
        // 授权
        me.add("/authorization", AuthorizationController.class);

        me.add("/admin", AdminController.class);
        me.add("/views", ViewsController.class);
        me.add("/plaza", PlazaController.class);
        me.add("/room", RoomController.class);

        me.add("/service", ServiceController.class);
        me.add("/node", NodeController.class);
        me.add("/user", UserController.class);
        me.add("/avatar", AvatarController.class);  //头像服务
    }

    /**
     * Config engine
     *
     * @param me me
     */
    @Override
    public void configEngine(Engine me) {
        me.setDevMode(getPropertyToBoolean("platform.devMode"));
        me.setBaseTemplatePath("/template");
        me.setToClassPathSourceFactory();
        VersionDirective.version = getProperty("platform.version", "1.0.1");
        me.addDirective("version", me.getDevMode() ? RandomDirective.class : VersionDirective.class);
    }

    /**
     * Config plugin
     *
     * @param me me
     */
    @Override
    public void configPlugin(Plugins me) {
        me.add(new ZkPlugin("zk.properties"));
    }

    /**
     * Config interceptor applied to all actions.
     *
     * @param me me
     */
    @Override
    public void configInterceptor(Interceptors me) {
        me.add(new ShiroInterceptor());
    }

    /**
     * Config handler
     *
     * @param me me
     */
    @Override
    public void configHandler(Handlers me) {
        me.add(new UrlFilterHandler("/sockjs-node/*.*"));
        me.add(new AllowCrossHandler());
        me.add(new TrimParameterHandler());
        me.add(new ContextPathHandler());
    }

    /**
     * Call back after JFinal start
     */
    @Override
    public void onStart() {
        try {
            aiJPlatformStarter = new AiJPlatformStarter();
            aiJPlatformStarter.start();
        } catch (Exception e) {
            throw new RuntimeException("初始化失败", e);
        }
    }

    /**
     * Call back before JFinal stop
     */
    @Override
    public void onStop() {
        aiJPlatformStarter.stop();
    }
}
