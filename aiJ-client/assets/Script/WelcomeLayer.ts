import ccclass = cc._decorator.ccclass;

import AppConfig from "./AppConfig";
import AlertWindow from "./AlertWindow";
import FireKit from "./fire/FireKit";
import PlazaConfig from "./plazz/PlazaConfig";
import UIManger from "./UIManger";
import PlazaLayer from "./plazz/PlazaLayer";
import AiJCCComponent from "./AiJCCComponent";
import HeroManager from "./hero/HeroManager";
import Hero from "./hero/Hero";
import PlazaLoginEventResponse from "./plazz/response/PlazaLoginEventResponse";
import AudioManager from "./AudioManager";
import WxHelper from "./WxHelper";

@ccclass
export default class WelcomeLayer extends AiJCCComponent {

    /**
     * UI
     */
    private _view: fgui.GComponent;


    /**
     * 加载
     */
    protected onLoad(): void {
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("ws_error", this.ws_error, this);
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("login_success", this.loginSuccessCb, this);
        this.loadPackage("welcome", () => {
                fgui.UIPackage.addPackage("welcome");
                this._view = fgui.UIPackage.createObject("welcome", "WelcomeLayer").asCom;
                this.initView();
                fgui.GRoot.inst.addChild(this._view);
            }
        );
    }

    protected onInitAiJCom(objs: any): void {
        PlazaConfig.init(AppConfig.PLAZA_WS_HOST, AppConfig.PLAZA_WS_PORT);
        AudioManager.play_music("commons", "bgm");
    }

    loginSuccessCb = (resp: PlazaLoginEventResponse) => {
        HeroManager.getInst().setMe(new Hero(resp.userName, resp.userId, resp.nickName, resp.gender, resp.avatar,
            resp.distributorId, resp.address, resp.longitude, resp.latitude, resp.ip, resp.certStatus)); //添加自己
        UIManger.getInst().switchLayer(PlazaLayer);
    };

    ws_error = function () { //绑定网络错误事件
        AlertWindow.alert("提示信息", "网络错误，请稍后再试！");
    };

    /**
     * 释放资源
     */
    protected onDestroy(): void {
        FireKit.use(AppConfig.PLAZA_FIRE).offGroup(this);
        this._view.dispose();
    }

    /**
     * 初始化登录视图
     */
    private initView(): void {
        this._view.getChild("username").asTextInput.text = "15000000004";
        this._view.getChild("password").asTextInput.text = "123456";
        this._view.getChild("login").asButton.onClick(() => {
            if (PlazaConfig.getInst()._aiJPro.isOpen()) {
                cc.sys.localStorage.setItem("user", JSON.stringify({
                    "username": this.username(),
                    "password": this.password()
                }));
                FireKit.use(AppConfig.LOCAL_FIRE).emit("login");    //登录事件
            } else {
                AlertWindow.alert("提示信息", "未连接服务器，请稍后再试！");
            }
        }, this);
        this._view.getChild("wx_login").asButton.onClick(() => {
            WxHelper.wxLogin(); //调用微信接口，实现微信登录
        }, this);
    }


    /**
     * 获取用户名
     */
    private username(): string {
        return this._view.getChild("username").asTextInput.text;
    }

    /**
     * 用户密码
     */
    private password(): string {
        return this._view.getChild("password").asTextInput.text;
    }


}
