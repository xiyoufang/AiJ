package com.xiyoufang.aij.platform.controller;

import com.jfinal.aop.Before;
import com.jfinal.core.paragetter.Para;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.platform.config.AiJPlatformDb;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;
import com.xiyoufang.aij.platform.domain.UserDO;
import com.xiyoufang.aij.platform.dto.UserDTO;
import com.xiyoufang.aij.platform.vo.LoginVO;
import com.xiyoufang.aij.user.UserService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import org.apache.shiro.authz.annotation.RequiresAuthentication;
import org.apache.shiro.authz.annotation.RequiresRoles;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class UserController extends BaseController {

    /**
     * 获取用户信息
     */
    @RequiresAuthentication
    public void info() {
        UserDO userDO = userDO();
        renderOk(Kv.by("data", new LoginVO()
                .setAvatar(userDO.getAvatar())
                .setRoles(userDO.getRoles())
                .setIntroduction(userDO.getIntroduction())
                .setName(userDO.getUserName())
                .setPermissions(userDO.getPermissions())
        ));
    }

    /**
     * 获取用户列表
     */
    @RequiresRoles({"administrator"})
    public void page(int limit, int page,
                     @Para(value = "user_name") String userName,
                     Integer status,
                     String sort) {
        SqlPara sqlPara = AiJPlatformDb.uc().getSqlPara("users.get_user_page",
                Kv.by("user_name", userName).set("status", status));
        Page<Record> recordPage = AiJPlatformDb.uc().paginate(page, limit, sqlPara);
        renderOk(Kv.by("data", Kv.create().set("total", recordPage.getTotalRow()).set("items", recordPage.getList().stream().map(Record::getColumns).toArray())));
    }

    /**
     * 更新用户状态
     */
    @RequiresRoles({"administrator"})
    @Before(BodyInject.class)
    public void updateStatus(@Body UserDTO userDTO) {
        if (UserService.me().updateStatusById(userDTO.getId(), userDTO.getStatus())) {
            renderOk(Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "success"));
        } else {
            renderWithCode(ResponseStatusCode.OPERATION_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "operation failed"));
        }
    }

}
