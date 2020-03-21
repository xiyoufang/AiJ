package com.xiyoufang.jfinal.body;


import com.jfinal.aop.Interceptor;
import com.jfinal.aop.Invocation;
import com.jfinal.core.Controller;
import com.jfinal.json.FastJsonFactory;

import java.lang.annotation.Annotation;

/**
 * Created by 席有芳 on 2020-03-21.
 * Body 请求拦截器
 *
 * @author 席有芳
 */
public class BodyRequest implements Interceptor {

    @Override
    public void intercept(Invocation inv) {
        Controller controller = inv.getController();
        Class<?>[] parameterTypes = inv.getMethod().getParameterTypes();
        if (parameterTypes.length == 1) {
            Object o = FastJsonFactory.me().getJson().parse(controller.getRawData(), parameterTypes[0]);
            inv.setArg(0, o);
        } else {
            Annotation[] annotations = inv.getMethod().getAnnotations();
            for (int i = 0; i < parameterTypes.length; i++) {
                for (Annotation annotation : annotations) {
                    if (annotation.annotationType() == Body.class) {
                        Object o = FastJsonFactory.me().getJson().parse(controller.getRawData(), parameterTypes[i]);
                        inv.setArg(i, o);
                        break;
                    }
                }
            }
        }
        inv.invoke();
    }
}
