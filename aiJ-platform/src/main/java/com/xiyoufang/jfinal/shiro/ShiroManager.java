package com.xiyoufang.jfinal.shiro;

import com.jfinal.config.Routes;
import com.jfinal.core.Controller;
import com.xiyoufang.jfinal.shiro.annotation.Permission;
import org.apache.shiro.authz.annotation.RequiresPermissions;

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
    private List<PermissionMapping> permissionMappings = new ArrayList<>();

    /**
     * 权限列表
     */
    private List<String> permissions = new ArrayList<>();

    private ShiroManager() {

    }

    public static ShiroManager me() {
        return me;
    }

    public void init(List<Routes.Route> routes) {
        initPermission(routes);
    }

    public List<PermissionMapping> getPermissionMappings() {
        return permissionMappings;
    }

    /**
     * 获取所有的权限信息
     *
     * @return permissions
     */
    public List<String> getPermissions() {
        return permissions;
    }

    /**
     * 初始化权限
     *
     * @param routes routes
     */
    private void initPermission(List<Routes.Route> routes) {
        for (Routes.Route route : routes) {
            Class<? extends Controller> controllerClass = route.getControllerClass();
            parsingRequiresPermissionsAnnotation(controllerClass.getAnnotation(RequiresPermissions.class));
            Method[] methods = controllerClass.getMethods();
            for (Method method : methods) {
                parsingPermissionAnnotation(method.getAnnotation(Permission.class));
                parsingRequiresPermissionsAnnotation(method.getAnnotation(RequiresPermissions.class));
            }

        }
    }

    /**
     * 解析 permission 注解
     *
     * @param permission permission
     */
    private void parsingPermissionAnnotation(Permission permission) {
        if (permission != null) {
            permissionMappings.add(new PermissionMapping(permission.key(), permission.name()));
        }
    }

    /**
     * 解析 requiresPermissions 注解
     *
     * @param requiresPermissions requiresPermissions
     */
    private void parsingRequiresPermissionsAnnotation(RequiresPermissions requiresPermissions) {
        if (requiresPermissions != null) {
            for (String permission : requiresPermissions.value()) {
                if (!this.permissions.contains(permission)) {
                    this.permissions.add(permission);
                }
            }
        }
    }

}
