package com.xiyoufang.aij.platform.controller;

import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import org.apache.shiro.authz.annotation.RequiresRoles;

/**
 * Created by 席有芳 on 2018-12-31.
 * 服务类型信息
 *
 * @author 席有芳
 */
public class ServiceController extends BaseController {

    @RequiresRoles("administrator")
    public void page(int limit, int page, String sort) {
        Page<Record> recordPage = AiJPlatformDb.platform().paginateByFullSql(page, limit, "select count(1) from service", "select * from service");
        renderOk(Kv.by("data", Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }

}
