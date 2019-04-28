package com.xiyoufang.jfinal.shiro;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.jfinal.kit.LogKit;
import org.apache.shiro.aop.MethodInvocation;
import org.apache.shiro.authz.AuthorizationException;
import org.apache.shiro.authz.UnauthenticatedException;
import org.apache.shiro.authz.aop.AnnotationsAuthorizingMethodInterceptor;

import java.lang.reflect.Method;

/**
 * Shiro 拦截器
 */
public class ShiroInterceptor extends AnnotationsAuthorizingMethodInterceptor implements Interceptor {

    public ShiroInterceptor() {
        getMethodInterceptors();    //用来扩展其他注解
    }

    @Override
    public void intercept(final Invocation inv) {
        try {
            invoke(new MethodInvocation() {
                @Override
                public Object proceed() {
                    inv.invoke();
                    return inv.getReturnValue();
                }

                @Override
                public Method getMethod() {
                    return inv.getMethod();
                }

                @Override
                public Object[] getArguments() {
                    return inv.getArgs();
                }

                @Override
                public Object getThis() {
                    return inv.getController();
                }
            });
        } catch (Throwable e) {
            if (e instanceof UnauthenticatedException) { //没有登陆
                LogKit.warn("未登陆:", e);
                doProcessUnauthenticated(inv.getController());
            } else if(e instanceof AuthorizationException) {   //权限不足
                LogKit.warn("权限错误:", e);
                doProcessUnauthorized(inv.getController());
            }else {
                LogKit.error("系统错误:", e);
                inv.getController().renderError(500);
            }
        }
    }

    /**
     * 未登陆
     * @param controller controller
     */
    private void doProcessUnauthenticated(Controller controller){
        controller.redirect("/");
    }

    /**
     * 未授权处理
     *
     * @param controller controller
     */
    private void doProcessUnauthorized(Controller controller) {
        controller.renderError(401);
    }
}
