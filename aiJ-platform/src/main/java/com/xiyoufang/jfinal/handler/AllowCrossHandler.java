package com.xiyoufang.jfinal.handler;

import com.jfinal.handler.Handler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by 席有芳 on 2019-11-18.
 *
 * @author 席有芳
 */
public class AllowCrossHandler extends Handler {
    /**
     * Handle target
     *
     * @param target    url target of this web http request
     * @param request   HttpServletRequest of this http request
     * @param response  HttpServletResponse of this http response
     * @param isHandled JFinalFilter will invoke doFilter() method if isHandled[0] == false,
     */
    @Override
    public void handle(String target, HttpServletRequest request, HttpServletResponse response, boolean[] isHandled) {
        response.addHeader("Access-Control-Allow-Methods", "*");
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Access-Control-Allow-Headers","*");
        next.handle(target, request, response, isHandled);
    }
}
