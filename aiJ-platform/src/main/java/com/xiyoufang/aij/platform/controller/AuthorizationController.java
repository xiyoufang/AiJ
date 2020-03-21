package com.xiyoufang.aij.platform.controller;

import com.jfinal.aop.Before;
import com.jfinal.kit.Kv;
import com.xiyoufang.aij.platform.dto.LoginFormDTO;
import com.xiyoufang.aij.platform.vo.LoginVO;
import com.xiyoufang.jfinal.body.Body;
import com.xiyoufang.jfinal.body.BodyRequest;

import java.util.Arrays;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class AuthorizationController extends BaseController {

    /**
     * 登录
     */
    @Before(BodyRequest.class)
    public void login(@Body LoginFormDTO loginFormDTO) {
        renderOk(Kv.by("data", new LoginVO()
                .setAvatar("https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif")
                .setPermissions(Arrays.asList("administrator", "player"))
                .setIntroduction("I am a super administrator")
                .setName("Super Admin")
        ));
    }

    /**
     * 退出登录
     */
    public void logout() {

    }

}
