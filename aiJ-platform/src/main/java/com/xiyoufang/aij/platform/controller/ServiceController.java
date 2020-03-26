package com.xiyoufang.aij.platform.controller;

import com.jfinal.aop.Before;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.dto.ServiceDTO;
import com.xiyoufang.aij.platform.service.ServiceService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authz.annotation.RequiresRoles;

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
    @RequiresRoles("administrator")
    public void page(int limit, int page, String sort) {
        Page<Record> recordPage = AiJPlatformDb.platform().paginateByFullSql(page, limit, "select count(1) from service", "select * from service");
        renderOk(Kv.by("data", Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }

    /**
     * 新增service
     *
     * @param serviceDTO serviceDTO
     */
    @RequiresRoles("administrator")
    @Before(BodyInject.class)
    public void create(@Body ServiceDTO serviceDTO) {
        Record record = ServiceService.me.save(serviceDTO);
        renderOk(Kv.by("data", record));
    }

    /**
     * 更新 service
     *
     * @param serviceDTO serviceDTO
     */
    @RequiresRoles("administrator")
    @Before(BodyInject.class)
    public void update(@Body ServiceDTO serviceDTO) {
        Record record = ServiceService.me.update(serviceDTO);
        renderOk(Kv.by("data", record));
    }

}
