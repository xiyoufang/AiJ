package com.xiyoufang.aij.platform.controller;

import com.jfinal.aop.Before;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;
import com.xiyoufang.aij.platform.service.ServiceService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authz.annotation.RequiresPermissions;

import java.util.HashMap;

/**
 * Created by 席有芳 on 2018-12-31.
 * 服务类型信息
 *
 * @author 席有芳
 */
@Slf4j
public class ServiceController extends BaseController {

    /**
     * 分页获取服务信息
     *
     * @param limit 每页显示
     * @param page  当前页
     * @param sort  排序
     */
    @RequiresPermissions("ServiceController_Page")
    public void page(int limit, int page, String sort, String name) {
        SqlPara sqlPara = AiJPlatformDb.platform().getSqlPara("platform.get_service_page", Kv.by("name", name));
        Page<Record> recordPage = AiJPlatformDb.platform().paginate(page, limit, sqlPara);
        renderOk(Kv.by(ResponseStatusCode.DATA_KEY, Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }

    /**
     * 新增service
     *
     * @param serviceDTO serviceDTO
     */
    @RequiresPermissions("ServiceController_Create")
    @Before({BodyInject.class})
    public void create(@Body HashMap<String, Object> serviceDTO) {

        Record record = new Record().setColumns(serviceDTO);
        if (ServiceService.me.save(record)) {
            renderOk(Kv.by(ResponseStatusCode.DATA_KEY, record).set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

    /**
     * 更新 service
     *
     * @param serviceDTO serviceDTO
     */
    @RequiresPermissions("ServiceController_Update")
    @Before({BodyInject.class})
    public void update(@Body HashMap<String, Object> serviceDTO) {
        Record record = new Record().setColumns(serviceDTO);
        if (ServiceService.me.update(record)) {
            renderOk(Kv.by(ResponseStatusCode.DATA_KEY, record).set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

}
