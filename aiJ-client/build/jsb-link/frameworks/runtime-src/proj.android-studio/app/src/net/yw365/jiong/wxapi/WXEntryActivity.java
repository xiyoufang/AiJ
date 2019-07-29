package net.yw365.jiong.wxapi;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import com.tencent.mm.opensdk.constants.ConstantsAPI;
import com.tencent.mm.opensdk.modelbase.BaseReq;
import com.tencent.mm.opensdk.modelbase.BaseResp;
import com.tencent.mm.opensdk.modelmsg.SendAuth;
import com.tencent.mm.opensdk.openapi.IWXAPIEventHandler;
import com.xiyoufang.aij.wx.WxHelper;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

/**
 * Created by youfangxi@gmail.com on 2019-07-22.
 *
 * @author youfangxi@gmail.com
 */
public class WXEntryActivity extends Activity implements IWXAPIEventHandler {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        AppActivity.getInstance().wxApi.handleIntent(getIntent(), this);
    }

    /**
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
//                                Cocos2dxJavascriptJavaBridge.evalString("cc.log(\"code:" + code + "\")");
                                Cocos2dxJavascriptJavaBridge.evalString("cc.WxHelper.onWxLogin(\"" + code + "\")");
                            }
                        });
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
