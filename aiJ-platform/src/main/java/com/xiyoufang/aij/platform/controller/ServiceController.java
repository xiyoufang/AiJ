package com.xiyoufang.aij.platform.controller;

import org.apache.shiro.authz.annotation.RequiresRoles;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ServiceController extends BaseController {

    @RequiresRoles("administrator")
    public void page() {

    }

}
