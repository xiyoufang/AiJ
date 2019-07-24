package net.yw365.jiong.wxapi;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.alibaba.fastjson.JSON;
import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.xiyoufang.aij.wx.WxHelper;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.jsoup.Jsoup;
import org.jsoup.helper.HttpConnection;

import java.io.IOException;
import java.util.Arrays;

/**
 * Created by youfangxi@gmail.com on 2019-07-22.
 *
 * @author youfangxi@gmail.com
 */
public class WXEntryActivity extends Activity implements IWXAPIEventHandler {

    /**
     * AppSecret
     */
    private final String APP_SECRET = "61fca66cdaf99017bbd2f78c4393b84a";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppActivity.getInstance().wxApi.handleIntent(getIntent(), this);
    }

    /**
     * 发送请求事件回调
     *
     * @param baseReq 请求报文
     */
    @Override
    public void onReq(BaseReq baseReq) {
        Log.i(WxHelper.WX_API_TAG, "onReq:" + baseReq.getClass().getSimpleName());
    }

    /**
     * 接收响应
     *
     * @param baseResp 响应报文
     */
    @Override
    public void onResp(BaseResp baseResp) {
        Log.i(WxHelper.WX_API_TAG, "onResp:" + baseResp.getClass().getSimpleName());
        switch (baseResp.errCode) {
            case BaseResp.ErrCode.ERR_OK:
                switch (baseResp.getType()) {
                    case ConstantsAPI.COMMAND_SENDAUTH: {   //授权响应
                        final String code = ((SendAuth.Resp) baseResp).code;
                        AppActivity.getInstance().runOnGLThread(new Runnable() {
                            @Override
                            public void run() {
                                //将code 传递到cocoscreator.
                                Cocos2dxJavascriptJavaBridge.evalString("WxHelper.onWxLogin(\"" + code + "\")");
                            }
                        });

//                        new Thread(new Runnable() {
//                            @Override
//                            public void run() {
//                                try {
//                                    String body = Jsoup.connect("https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code")
//                                            .data("appid", AppActivity.getInstance().APP_ID,
//                                                    "secret", APP_SECRET,
//                                                    "code", code)
//                                            .timeout(10 * 1000).ignoreContentType(true).execute().body();
//                                    Log.i(WxHelper.WX_API_TAG, body);
//                                    //https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID
//                                    /*
//                                    * {
//                                        "access_token":"ACCESS_TOKEN",
//                                        "expires_in":7200,
//                                        "refresh_token":"REFRESH_TOKEN",
//                                        "openid":"OPENID",
//                                        "scope":"SCOPE",
//                                        "unionid":"o6_bmasdasdsad6_2sgVt7hMZOPfL"
//                                        }
//                                    * */
//                                    String accessToken = JSON.parseObject(body).getString("access_token");
//                                    String openid = JSON.parseObject(body).getString("openid");
//                                    body = Jsoup.connect("https://api.weixin.qq.com/sns/userinfo")
//                                            .data("access_token", accessToken, "openid", openid)
//                                            .timeout(10 * 1000).ignoreContentType(true).execute().body();
//                                    Log.i(WxHelper.WX_API_TAG, body);
//                                    /*
//                                    {
//                                    "openid":"OPENID",
//                                    "nickname":"NICKNAME",
//                                    "sex":1,
//                                    "province":"PROVINCE",
//                                    "city":"CITY",
//                                    "country":"COUNTRY",
//                                    "headimgurl": "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/0",
//                                    "privilege":[
//                                    "PRIVILEGE1",
//                                    "PRIVILEGE2"
//                                    ],
//                                    "unionid": " o6_bmasdasdsad6_2sgVt7hMZOPfL"
//                                    }
//                                    * */
//                                    //信息获取成功后，调用cocos creator 将信息传递到cocos creator.
//                                    //两种方式 1、android中获取头像等信息后传递给cocos creator，
//                                    // 2、android获取到token，传递给cocos creator
//                                    // 第二种方式更合适，因为代码可以和IOS共用
//                                } catch (Exception e) {
//                                    Log.e(WxHelper.WX_API_TAG, e.getMessage());
//                                    //错误
//                                }
//                            }
//                        }).start();
                        break;
                    }
                    case ConstantsAPI.COMMAND_SENDMESSAGE_TO_WX: {  //发送信息到微信的响应

                        break;
                    }
                    default:
                        break;
                }
                break;
            case BaseResp.ErrCode.ERR_AUTH_DENIED:
                break;
            case BaseResp.ErrCode.ERR_USER_CANCEL:
                break;
            case BaseResp.ErrCode.ERR_SENT_FAILED:
                break;
            case BaseResp.ErrCode.ERR_BAN:
                break;
            case BaseResp.ErrCode.ERR_COMM:
                break;
            case BaseResp.ErrCode.ERR_UNSUPPORT:
                break;
        }
        finish();   //关闭当前界面
    }
}
