import ccclass = cc._decorator.ccclass;

export default class WxHelper {

    /**
     * 微信登录回调
     * @param token
     */
    public static onWxLogin(token: string): void {
        cc.log("token:" + token)
    }
}
