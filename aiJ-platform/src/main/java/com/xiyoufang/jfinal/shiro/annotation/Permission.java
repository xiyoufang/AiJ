package com.xiyoufang.jfinal.shiro.annotation;

import java.lang.annotation.*;

/**
 * Created by 席有芳 on 2017/9/16.
 *
 * @author 席有芳
 */
@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface Permission {
    String key();   //权限Key
    String name();  //权限名称
}
