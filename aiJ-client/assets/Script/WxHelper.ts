import AiJKit from "./ws/AiJKit";
import AppConfig from "./AppConfig";
import PlazaWeiXinLoginEvent from "./plazz/event/PlazaWeiXinLoginEvent";
import PlazaConfig from "./plazz/PlazaConfig";
import AlertWindow from "./AlertWindow";

export default class WxHelper {
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
    }

}
cc['WxHelper'] = WxHelper;
