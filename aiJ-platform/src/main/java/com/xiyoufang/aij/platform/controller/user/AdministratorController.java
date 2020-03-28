package com.xiyoufang.aij.platform.controller.user;

import com.jfinal.aop.Before;
import com.jfinal.core.paragetter.Para;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;
import com.xiyoufang.aij.platform.controller.BaseController;
import com.xiyoufang.aij.platform.service.RoleService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import org.apache.shiro.authz.annotation.RequiresRoles;

import java.util.HashMap;

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
        SqlPara sqlPara = AiJPlatformDb.uc().getSqlPara("uc.get_administrator_page",
                Kv.by("user_name", userName).set("status", status));
        Page<Record> recordPage = AiJPlatformDb.uc().paginate(page, limit, sqlPara);
        renderOk(Kv.by("data", Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }


    /**
     * 更新平台状态
     */
    @RequiresRoles({"administrator"})
    @Before(BodyInject.class)
    public void update(@Body HashMap<String, Object> userRoleDTO) {
        Record record = new Record().setColumns(userRoleDTO);
        if (RoleService.me.update(record)) {
            renderOk(Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

    /**
     * 新增用户
     *
     * @param userRoleDTO userRoleDTO
     */
    @RequiresRoles({"administrator"})
    @Before(BodyInject.class)
    public void create(@Body HashMap<String, Object> userRoleDTO) {
        Record record = new Record().setColumns(userRoleDTO);
        if (RoleService.me.save(record)) {
            renderOk(Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

}
