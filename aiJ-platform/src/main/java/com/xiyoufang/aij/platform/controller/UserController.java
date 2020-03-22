package com.xiyoufang.aij.platform.controller;

import com.jfinal.json.Json;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Db;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.CoreConfig;
import com.xiyoufang.aij.platform.vo.LoginVO;
import com.xiyoufang.jfinal.datatables.Datatable;
import com.xiyoufang.jfinal.datatables.DatatableInjector;
import com.xiyoufang.jfinal.datatables.DatatableUtils;

import java.util.Arrays;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class UserController extends BaseController {

    /**
     * 获取用户信息
     */
    public void info(String token) {
        renderOk(Kv.by("data", new LoginVO()
                .setAvatar("https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif")
                .setRoles(Arrays.asList("admin", "player"))
                .setIntroduction("I am a super administrator")
                .setName("Super Admin")
                .setPermissions(Arrays.asList("view", "edit", "add"))
        ));
    }

    public void page() {
        Datatable datatable = DatatableInjector.getDatatable(getRequest());
        Page<Record> page = Db.use(AppConfig.use().getStr(CoreConfig.DS_USER_CENTER)).paginateByFullSql(datatable.getPage(), datatable.getLength(), "select count(1) from user_profile",
                "select * from user_profile");
        renderJson(Json.getJson().toJson(DatatableUtils.getDataTableRender(page, datatable.getDraw(), Record.class)));
    }


}
