package com.xiyoufang.aij.platform.controller.user;

import com.jfinal.core.paragetter.Para;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.controller.BaseController;
import org.apache.shiro.authz.annotation.RequiresRoles;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class AdministratorController extends BaseController {

    /**
     * 获取用户列表
     */
    @RequiresRoles({"administrator"})
    public void page(int limit, int page,
                     @Para(value = "user_name") String userName,
                     Integer status,
                     String sort) {
        SqlPara sqlPara = AiJPlatformDb.uc().getSqlPara("users.get_administrator_page",
                Kv.by("user_name", userName).set("status", status));
        Page<Record> recordPage = AiJPlatformDb.uc().paginate(page, limit, sqlPara);
        renderOk(Kv.by("data", Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }

}
