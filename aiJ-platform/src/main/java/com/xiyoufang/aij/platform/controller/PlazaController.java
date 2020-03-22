package com.xiyoufang.aij.platform.controller;

import com.xiyoufang.aij.core.ServiceType;
import org.apache.shiro.authz.annotation.RequiresRoles;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class PlazaController extends ServiceDetailController {

    @RequiresRoles("administrator")
    public void page(int limit, int page) {
        getPage(limit, page, ServiceType.PLAZA);
    }
}
