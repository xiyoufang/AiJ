// import axios from "axios"

import AiJKit from "./ws/AiJKit";
import AppConfig from "./AppConfig";
import PlazaWeiXinLoginEvent from "./plazz/event/PlazaWeiXinLoginEvent";
import PlazaConfig from "./plazz/PlazaConfig";
import AlertWindow from "./AlertWindow";

export default class WxHelper {
    /**
     * 微信APP ID
     */
    public static appId: string = 'wx7da1c028a41aeaf3';
    /**
     * 微信secret
     */
    public static secret: string = '61fca66cdaf99017bbd2f78c4393b84a';

    /**
     * 微信登录
     */
    public static wxLogin() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("com/xiyoufang/aij/wx/WxHelper", "wxLogin", "()V")
        }
    }

    /**
     * 登录
     * @param code
     */
    public static onWxLogin(code) {
        cc.log("code:" + code);
        if (PlazaConfig.getInst()._aiJPro.isOpen()) {
            AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new PlazaWeiXinLoginEvent(code));
        } else {
            AlertWindow.alert("提示信息", "未连接服务器，请稍后再试！");
        }
        /*
        此处有风险，不建议使用.
        WxHelper.get('https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code' +
            '&appid=wx7da1c028a41aeaf3' +
            '&secret=61fca66cdaf99017bbd2f78c4393b84a' +
            '&code=' + code, {
                "perform": function (text) {
                    console.log(text);
                    let accessToken = JSON.stringify(text)['access_token'];
                    let openid = JSON.stringify(text)['openid'];
                    WxHelper.get('https://api.weixin.qq.com/sns/userinfo?' +
                        'access_token=' + accessToken +
                        '&openid=' + openid, {
                            "perform": function (text) {
                                console.log(text);
                            }
                        }
                    );
                }
            }
        );*/
    }

    /**
     * Http Request
     * @param url
     * @param callback
     */
    public static get(url: string, callback) {
        let request = cc.loader.getXMLHttpRequest();
        request.open("GET", url, true);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                //get status text
                var httpStatus = request.statusText;
                if (callback != null) {
                    callback.perform(request.responseText);
                }
            }
        };
        request.send();
    }

}
cc['WxHelper'] = WxHelper;
