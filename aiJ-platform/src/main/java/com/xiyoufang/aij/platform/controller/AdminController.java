package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.ActionKey;
import com.jfinal.core.Controller;

/**
 * Created by 席有芳 on 2018-12-30.
 *
 * @author 席有芳
 */
public class AdminController extends Controller {

    public void index() {
        render("/index.html");
    }

}
