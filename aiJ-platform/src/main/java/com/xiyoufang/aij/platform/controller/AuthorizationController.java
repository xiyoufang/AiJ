package com.xiyoufang.aij.platform.controller;

import com.jfinal.aop.Before;
import com.jfinal.kit.Kv;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;
import com.xiyoufang.aij.platform.domain.UserDO;
import com.xiyoufang.aij.platform.dto.LoginFormDTO;
import com.xiyoufang.aij.platform.shiro.AiJAuthenticationToken;
import com.xiyoufang.aij.platform.vo.LoginVO;
import com.xiyoufang.aij.platform.vo.TokenVO;
import com.xiyoufang.aij.user.UserService;
import com.xiyoufang.jfinal.aop.Body;
import com.xiyoufang.jfinal.aop.BodyInject;
import com.xiyoufang.jfinal.aop.Header;
import com.xiyoufang.jfinal.aop.HeaderInject;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authz.annotation.RequiresAuthentication;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class AuthorizationController extends BaseController {

    /**
     * 登录
     */
    @Before(BodyInject.class)
    public void login(@Body LoginFormDTO loginFormDTO) {
        Record record = UserService.me().findUserByMobile(loginFormDTO.getUsername());
        if (UserService.me().authenticate(loginFormDTO.getPassword(), record)) {
            SecurityUtils.getSubject().login(new AiJAuthenticationToken(new UserDO(record)));
            String token = (String) SecurityUtils.getSubject().getSession().getId();
            renderOk(Kv.create().set(ResponseStatusCode.DATA_KEY, new TokenVO().setToken(token)));
        } else {
            renderWithCode(ResponseStatusCode.LOGIN_FAILURE, Kv.create().set(ResponseStatusCode.MESSAGE_KEY, "failure."));
        }
    }

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
                .setMenus(userDO.getMenus())
        ));
    }

    /**
     * 退出登录
     */
    @RequiresAuthentication
    @Before(HeaderInject.class)
    public void logout(@Header("X-Token") String token) {
        SecurityUtils.getSubject().logout();
        renderOk(Kv.create().set(ResponseStatusCode.DATA_KEY, "success"));
    }

}
