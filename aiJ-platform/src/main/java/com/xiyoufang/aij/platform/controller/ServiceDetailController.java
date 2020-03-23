package com.xiyoufang.aij.platform.controller;

import com.jfinal.plugin.activerecord.Page;
import com.xiyoufang.aij.core.ServiceDetail;
import com.xiyoufang.aij.core.ServiceType;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ServiceDetailController extends BaseController {

    /**
     * 获取服务page
     *
     * @param serviceType serviceType
     * @return Page
     */
    protected Page<ServiceDetail> getPage(int limit, int page, ServiceType serviceType) {
        /*
        List<ServiceDetail> details = ZkKit.use().discovery(ServiceDetail.class, AppConfig.use().getStr(CoreConfig.REGISTER_PATH), serviceType.name());
        int totalRow = details.size();
        return new Page<ServiceDetail>(details, page, limit, totalRow / limit + (totalRow % limit > 0 ? 1 : 0), totalRow);
        */
        return null;
    }

}
