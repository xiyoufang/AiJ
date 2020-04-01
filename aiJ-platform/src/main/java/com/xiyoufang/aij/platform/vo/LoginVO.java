package com.xiyoufang.aij.platform.vo;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Set;

/**
 * Created by 席有芳 on 2020-03-21.
 *
 * @author 席有芳
 */
@Data
@Accessors(chain = true)
public class LoginVO {

    /*
        roles: ['admin'],
        introduction: 'I am a super administrator',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        name: 'Super Admin'
    * */
    /**
     * 角色信息
     */
    private Set<String> roles;
    /**
     * 介绍
     */
    private String introduction;
    /**
     * 用户名称
     */
    private String name;
    /**
     * 头像
     */
    private String avatar;
    /**
     * 权限
     */
    private Set<String> permissions;
    /**
     * 菜单
     */
    private Set<String> menus;
}
