package com.xiyoufang.aij.platform.controller;

import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.CoreConfig;
import com.xiyoufang.aij.core.ServiceDetail;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;
import com.xiyoufang.jfinal.zk.ZkKit;
import org.apache.shiro.authz.annotation.RequiresPermissions;

import java.util.List;

/**
 * Created by 席有芳 on 2020-03-23.
 * 节点信息
 *
 * @author 席有芳
 */
public class NodeController extends BaseController {

    @RequiresPermissions("NodeController_Page")
    public void page(int limit, int page, String sort) {
        List<ServiceDetail> details = ZkKit.use().discovery(ServiceDetail.class, AppConfig.use().getStr(CoreConfig.REGISTER_PATH));
        int totalRow = details.size();
        Page<ServiceDetail> nodePage = new Page<>(details, page, limit, totalRow / limit + (totalRow % limit > 0 ? 1 : 0), totalRow);
        renderOk(Kv.by(ResponseStatusCode.DATA_KEY, Kv.create().set("total", nodePage.getTotalRow()).set("items", nodePage.getList())));
    }

}
