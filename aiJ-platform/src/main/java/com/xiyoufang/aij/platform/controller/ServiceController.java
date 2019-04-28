package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.Controller;
import com.jfinal.json.Json;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.CoreConfig;
import com.xiyoufang.jfinal.datatables.Datatable;
import com.xiyoufang.jfinal.datatables.DatatableInjector;
import com.xiyoufang.jfinal.datatables.DatatableUtils;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ServiceController extends Controller {

    public void page() {
        Datatable datatable = DatatableInjector.getDatatable(getRequest());
        Page<Record> page = Db.use(AppConfig.use().getStr(CoreConfig.DS_PLATFORM)).paginateByFullSql(datatable.getPage(), datatable.getLength(), "select count(1) from service",
                "select * from service");
        renderJson(Json.getJson().toJson(DatatableUtils.getDataTableRender(page, datatable.getDraw(), Record.class)));
    }

}
