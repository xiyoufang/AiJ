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
import com.xiyoufang.aij.platform.service.UserRoleService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import org.apache.shiro.authz.annotation.RequiresPermissions;

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
    @RequiresPermissions("AdministratorController_Page")
    public void page(int limit, int page,
                     @Para(value = "nick_name") String nickName,
                     Integer status,
                     String sort) {
        SqlPara sqlPara = AiJPlatformDb.uc().getSqlPara("uc.get_administrator_page",
                Kv.by("nick_name", nickName).set("status", status));
        Page<Record> recordPage = AiJPlatformDb.uc().paginate(page, limit, sqlPara);
        renderOk(Kv.by(ResponseStatusCode.DATA_KEY, Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }


    /**
     * 更新平台状态
     */
    @RequiresPermissions("AdministratorController_Update")
    @Before(BodyInject.class)
    public void update(@Body HashMap<String, Object> userRoleDTO) {
        Record record = new Record().setColumns(userRoleDTO);
        if (UserRoleService.me.update(record)) {
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
    @RequiresPermissions("AdministratorController_Create")
    @Before(BodyInject.class)
    public void create(@Body HashMap<String, Object> userRoleDTO) {
        Record record = new Record().setColumns(userRoleDTO);
        if (UserRoleService.me.save(record)) {
            renderOk(Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

}
