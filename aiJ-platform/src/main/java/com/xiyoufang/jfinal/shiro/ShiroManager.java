package com.xiyoufang.jfinal.shiro;

import com.jfinal.config.Routes;
import com.jfinal.core.Controller;
import com.xiyoufang.jfinal.shiro.annotation.Permission;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;

/**
 * shiro 管理器.
 */
public class ShiroManager {

    /**
     * 权限管理器
     */
    private static ShiroManager me = new ShiroManager();
    /**
     * 权限Kv
     */
    private List<PermissionKv> permissionKvs = new ArrayList<PermissionKv>();

    private ShiroManager() {
    }

    public static ShiroManager me() {
        return me;
    }

    public void init(List<Routes.Route> routes) {
        initPermission(routes);
    }

    public List<PermissionKv> getPermissionKvs() {
        return permissionKvs;
    }

    /**
     * 初始化权限
     *
     * @param routes routes
     */
    private void initPermission(List<Routes.Route> routes) {
        for (Routes.Route route : routes) {
            Class<? extends Controller> controllerClass = route.getControllerClass();
            String controllerKey = route.getControllerKey();
            Annotation[] controllerAnnotations = controllerClass.getAnnotations();
            Method[] methods = controllerClass.getMethods();
            for (Method method : methods) {
                Permission annotation = method.getAnnotation(Permission.class);
                if (annotation != null) {
                    permissionKvs.add(new PermissionKv(annotation.key(), annotation.name()));
                }
            }
        }
    }

}
