package com.xiyoufang.aij.platform.controller;

import com.jfinal.json.Json;
import com.xiyoufang.aij.core.ServiceType;
import com.xiyoufang.jfinal.datatables.Datatable;
import com.xiyoufang.jfinal.datatables.DatatableInjector;
import com.xiyoufang.jfinal.datatables.DatatableUtils;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class RoomController extends ServiceDetailController {

    public void page() {
        Datatable datatable = DatatableInjector.getDatatable(getRequest());
        renderJson(Json.getJson().toJson(DatatableUtils.getDataTableRender(getPage(datatable, ServiceType.ROOM), datatable.getDraw())));
    }
}
