package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Page;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.CoreConfig;
import com.xiyoufang.aij.core.ServiceDetail;
import com.xiyoufang.aij.core.ServiceType;
import com.xiyoufang.jfinal.datatables.Datatable;
import com.xiyoufang.jfinal.datatables.DatatableUtils;
import com.xiyoufang.jfinal.zk.ZkKit;

import java.util.List;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ServiceDetailController extends Controller {

    /**
     * 获取服务page
     *
     * @param datatable   datatable
     * @param serviceType serviceType
     * @return Page
     */
    protected Page<ServiceDetail> getPage(Datatable datatable, ServiceType serviceType) {
        List<ServiceDetail> details = ZkKit.use().discovery(ServiceDetail.class, AppConfig.use().getStr(CoreConfig.REGISTER_PATH), serviceType.name());
        return new Page<ServiceDetail>(details, datatable.getPage(),
                datatable.getLength(), DatatableUtils.totalPage(details.size(), datatable.getLength()), details.size());
    }

}
