package com.xiyoufang.jfinal.shiro;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
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

    @Override
    public void intercept(final Invocation inv) {
        try {
            invoke(new JFinalMethodInvocation(inv));
        } catch (Throwable e) {
            if (e instanceof UnauthenticatedException) { //没有登陆
                LogKit.warn("UnauthenticatedException:", e);
                inv.getController().renderError(401);
            } else if (e instanceof AuthorizationException) {   //权限不足
                LogKit.warn("AuthorizationException", e);
                inv.getController().renderError(401);
            } else {
                LogKit.warn("Server Exception", e);
                inv.getController().renderError(500);
            }
        }
    }
}

/**
 * jFINAL 的方法调用
 */
class JFinalMethodInvocation implements MethodInvocation {

    private Invocation inv;

    public JFinalMethodInvocation(Invocation inv) {
        this.inv = inv;
    }

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
}
