package com.xiyoufang.aij.platform.controller;

import com.jfinal.aop.Before;
import com.jfinal.core.paragetter.Para;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;
import com.xiyoufang.aij.platform.service.RoleService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import com.xiyoufang.jfinal.shiro.ShiroManager;
import org.apache.shiro.authz.annotation.RequiresRoles;

import java.util.HashMap;
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
        renderOk(Kv.by(ResponseStatusCode.DATA_KEY, Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }


    /**
     * 获取所有的权限列表
     */
    @RequiresRoles({"administrator"})
    public void permissions() {
        List<String> permissions = ShiroManager.me().getPermissions();
        renderOk(Kv.by(ResponseStatusCode.DATA_KEY, permissions));
    }

    /**
     * 更新角色
     *
     * @param roleDTO roleDTO
     */
    @RequiresRoles({"administrator"})
    @Before(BodyInject.class)
    public void update(@Body HashMap<String, Object> roleDTO) {
        Record record = new Record().setColumns(roleDTO);
        if (RoleService.me.update(record)) {
            renderOk(Kv.by(ResponseStatusCode.DATA_KEY, record).set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

    /**
     * 创建角色
     *
     * @param roleDTO roleDTO
     */
    @RequiresRoles({"administrator"})
    @Before(BodyInject.class)
    public void create(@Body HashMap<String, Object> roleDTO) {
        Record record = new Record().setColumns(roleDTO);
        if (RoleService.me.save(record)) {
            renderOk(Kv.by(ResponseStatusCode.DATA_KEY, record).set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }
}
