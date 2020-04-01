package com.xiyoufang.jfinal.aop;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Created by 席有芳 on 2020-03-22.
 *
 * @author 席有芳
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface Header {
    /**
     * Header 的Key
     *
     * @return Key
     */
    String value();
}
