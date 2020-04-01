package com.xiyoufang.aij.platform.domain;

import com.jfinal.plugin.activerecord.Record;
import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Set;

/**
 * Created by 席有芳 on 2020-03-22.
 *
 * @author 席有芳
 */
@Data
@Accessors(chain = true)
public class UserDO implements Serializable {

    /**
     * 用户信息
     */
    private Record record;
    /**
     * 角色
     */
    private Set<String> roles;
    /**
     * 权限
     */
    private Set<String> permissions;
    /**
     * 菜单
     */
    private Set<String> menus;

    public UserDO(Record record) {
        this.record = record;
    }

    /**
     * 获取头像
     *
     * @return avatar
     */
    public String getAvatar() {
        return this.record.getStr("avatar");
    }

    /**
     * 获取用户名称
     *
     * @return name
     */
    public String getUserName() {
        return this.record.getStr("user_name");
    }

    /**
     * 介绍
     *
     * @return introduction
     */
    public String getIntroduction() {
        return this.record.getStr("introduction");
    }

}
