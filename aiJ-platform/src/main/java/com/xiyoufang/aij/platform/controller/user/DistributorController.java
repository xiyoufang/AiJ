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
import com.xiyoufang.aij.platform.service.DistributorService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import org.apache.shiro.authz.annotation.RequiresPermissions;

import java.util.HashMap;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class DistributorController extends BaseController {

    /**
     * 获取用户列表
     */
    @RequiresPermissions("DistributorController_Page")
    public void page(int limit, int page,
                     @Para(value = "nick_name") String nickName,
                     @Para(value = "parent_user_id") String parentUserId,
                     Integer status,
                     String sort) {
        SqlPara sqlPara = AiJPlatformDb.uc().getSqlPara("uc.get_distributor_page",
                Kv.by("nick_name", nickName).set("status", status).set("parent_user_id", parentUserId));
        Page<Record> recordPage = AiJPlatformDb.uc().paginate(page, limit, sqlPara);
        renderOk(Kv.by(ResponseStatusCode.DATA_KEY, Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }

    /**
     * 更新代理状态
     */
    @RequiresPermissions("DistributorController_Update")
    @Before(BodyInject.class)
    public void update(@Body HashMap<String, Object> distributorDTO) {
        Record record = new Record().setColumns(distributorDTO);
        if (DistributorService.me.update(record)) {
            renderOk(Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

    /**
     * 新增代理
     *
     * @param distributorDTO distributorDTO
     */
    @RequiresPermissions("DistributorController_Create")
    @Before(BodyInject.class)
    public void create(@Body HashMap<String, Object> distributorDTO) {
        Record record = new Record().setColumns(distributorDTO);
        if (DistributorService.me.save(record)) {
            renderOk(Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

}
