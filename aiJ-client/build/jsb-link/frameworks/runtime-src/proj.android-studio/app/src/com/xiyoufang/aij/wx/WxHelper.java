package com.xiyoufang.aij.wx;

import android.util.Log;

import com.tencent.mm.opensdk.modelmsg.SendAuth;

import org.cocos2dx.javascript.AppActivity;

/**
 * Created by youfangxi@gmail.com on 2019-07-22.
 *
 * @author youfangxi@gmail.com
 */
public class WxHelper {

    public final static String WX_API_TAG = "WxApi";

    public static void print() {
        System.out.println("print from cocos creator!");
    }

    /**
     * 微信登录请求，提供给Cocos Creator调用.
     */
    public static void wxLogin() {
        SendAuth.Req req = new SendAuth.Req();
        req.scope = "snsapi_userinfo";
        req.state = "0";
        AppActivity.getInstance().wxApi.sendReq(req);  //发送登录请求
        Log.i(WX_API_TAG, req.state);
    }

}
