package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.Controller;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class ViewsController extends Controller {

    /**
     * 主界面
     */
    public void main() {
        render("/views/main.html");
    }

    /**
     * 游戏服务
     */
    public void service() {
        render("/views/service.html");
    }

    /**
     * 游戏大厅
     */
    public void plaza() {
        render("/views/plaza.html");
    }

    /**
     * 游戏房间
     */
    public void room() {
        render("/views/room.html");
    }

    /**
     * 用户管理
     */
    public void users() {
        render("/views/users.html");
    }


}
