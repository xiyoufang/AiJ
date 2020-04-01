package com.xiyoufang.aij.platform;

import com.jfinal.config.*;
import com.jfinal.ext.handler.ContextPathHandler;
import com.jfinal.json.FastJsonFactory;
import com.jfinal.kit.Kv;
import com.jfinal.render.JsonRender;
import com.jfinal.render.Render;
import com.jfinal.render.RenderFactory;
import com.jfinal.render.RenderManager;
import com.jfinal.template.Engine;
import com.jfinal.template.ext.directive.RandomDirective;
import com.xiyoufang.aij.platform.controller.*;
import com.xiyoufang.aij.platform.controller.user.AdministratorController;
import com.xiyoufang.aij.platform.controller.user.DistributorController;
import com.xiyoufang.aij.platform.controller.user.PlayerController;
import com.xiyoufang.jfinal.directive.VersionDirective;
import com.xiyoufang.jfinal.handler.AllowCrossHandler;
import com.xiyoufang.jfinal.handler.TrimParameterHandler;
import com.xiyoufang.jfinal.handler.UrlFilterHandler;
import com.xiyoufang.jfinal.shiro.ShiroInterceptor;
import com.xiyoufang.jfinal.shiro.ShiroManager;
import com.xiyoufang.jfinal.zk.ZkPlugin;

/**
 * Created by 席有芳 on 2018-12-26.
 *
 * @author 席有芳
 */
public class AiJPlatformConfig extends JFinalConfig {

    /**
     * Web Socket Server
     */
    private AiJPlatformStarter aiJPlatformStarter;

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

        RenderManager.me().setRenderFactory(new RenderFactory() {
            @Override
            public Render getErrorRender(int errorCode) {
                String message;
                switch (errorCode) {
                    case 400:
                        message = "400 Bad Request";
                        break;
                    case 401:
                        message = "401 Unauthorized";
                        break;
                    case 403:
                        message = "403 Forbidden";
                        break;
                    case 404:
                        message = "404 Not Found";
                        break;
                    case 500:
                        message = "Internal Server Error";
                        break;
                    default:
                        message = "Error";
                }
                return new JsonRender(Kv.by("code", errorCode).set("message", message));
            }
        });
    }

    /**
     * Config route
     *
     * @param me me
     */
    @Override
    public void configRoute(Routes me) {
        me.add("/authorization", AuthorizationController.class);
        me.add("/role", RoleController.class);
        me.add("/service", ServiceController.class);
        me.add("/node", NodeController.class);
        me.add("/avatar", AvatarController.class);  //头像服务
        me.add("/admin", AdminController.class);
        me.add("/views", ViewsController.class);
        me.add(new Routes() {   // 用户相关
            @Override
            public void config() {
                me.add("/user/player", PlayerController.class);
                me.add("/user/administrator", AdministratorController.class);
                me.add("/user/distributor", DistributorController.class);
            }
        });
        ShiroManager.me().init(me.getRouteItemList());
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
