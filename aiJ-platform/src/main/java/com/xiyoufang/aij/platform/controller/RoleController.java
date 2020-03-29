package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.paragetter.Para;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.jfinal.shiro.ShiroManager;
import org.apache.shiro.authz.annotation.RequiresRoles;

import java.util.List;

/**
 * Created by 席有芳 on 2020-03-28.
 * 角色
 *
 * @author 席有芳
 */
public class RoleController extends BaseController {

    /**
     * 获取角色列表
     *
     * @param limit limit
     * @param page  page
     * @param name  name
     */
    @RequiresRoles({"administrator"})
    public void page(int limit, int page,
                     @Para(value = "name") String name) {
        SqlPara sqlPara = AiJPlatformDb.uc().getSqlPara("uc.get_role_page", Kv.by("name", name));
        Page<Record> recordPage = AiJPlatformDb.uc().paginate(page, limit, sqlPara);
        renderOk(Kv.by("data", Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }


    /**
     * 获取所有的权限列表
     */
    @RequiresRoles({"administrator"})
    public void permissions() {
        List<String> permissions = ShiroManager.me().getPermissions();
        renderOk(Kv.by("data", permissions));
    }

}
