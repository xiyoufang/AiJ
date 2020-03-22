package com.xiyoufang.aij.platform.controller;

import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.domain.UserDO;
import com.xiyoufang.aij.platform.vo.LoginVO;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresRoles;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class UserController extends BaseController {

    /**
     * 获取用户信息
     */
    @RequiresAuthentication
    public void info() {
        UserDO userDO = userDO();
        renderOk(Kv.by("data", new LoginVO()
                .setAvatar(userDO.getAvatar())
                .setRoles(userDO.getRoles())
                .setIntroduction(userDO.getIntroduction())
                .setName(userDO.getUserName())
                .setPermissions(userDO.getPermissions())
        ));
    }

    /**
     * 获取用户列表
     */
    @RequiresRoles({"administrator"})
    public void page(int limit, int page, String sort) {
        Page<Record> recordPage = AiJPlatformDb.uc().paginateByFullSql(page, limit, "select count(1) from user_profile", "select * from user_profile");
        renderOk(Kv.by("data", Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }

}
