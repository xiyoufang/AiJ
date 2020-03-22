package com.xiyoufang.jfinal.aop;

import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;

import java.lang.annotation.Annotation;

/**
 * Created by 席有芳 on 2020-03-22.
 * 请求头注入
 *
 * @author 席有芳
 */
public class HeaderInject implements Interceptor {

    @Override
    public void intercept(Invocation inv) {

        Controller controller = inv.getController();
        Class<?>[] parameterTypes = inv.getMethod().getParameterTypes();
        Annotation[][] parameterAnnotations = inv.getMethod().getParameterAnnotations();
        for (int i = 0; i < parameterTypes.length; i++) {
            for (Annotation[] annotations : parameterAnnotations) {
                for (Annotation annotation : annotations) {
                    if (annotation.annotationType() == Header.class) {
                        if (parameterTypes[i] == String.class) {
                            String value = controller.getHeader(((Header) annotation).value());
                            inv.setArg(i, value);
                        } else {
                            throw new AopException("header annotation only support string type parameter");
                        }
                    }
                }
            }
        }
        inv.invoke();
    }
}
