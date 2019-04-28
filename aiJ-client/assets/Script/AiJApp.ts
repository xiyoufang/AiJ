import ccclass = cc._decorator.ccclass;
import WelcomeLayer from "./WelcomeLayer";
import UIManger from "./UIManger";
import AppConfig from "./AppConfig";
import FireKit from "./fire/FireKit";

@ccclass
export default class AiJApp extends cc.Component {

    protected onLoad(): void {
        fgui.addLoadHandler();
        fgui.GRoot.create();
        fgui.UIPackage.loadPackage("commons", () => {
                fgui.UIPackage.addPackage("commons");    //初始化公共Layer
                AiJApp.initFire();
                AiJApp.initDialog();
                UIManger.getInst().setRoot(this);
                UIManger.getInst().switchLayer(WelcomeLayer);
            }
        );
    }

    /**
     * 初始化事件系统
     */
    private static initFire() {
        FireKit.init(AppConfig.LOCAL_FIRE);
        FireKit.init(AppConfig.PLAZA_FIRE);
        FireKit.init(AppConfig.GAME_FIRE);
    }

    /**
     * 初始化对话框
     */
    private static initDialog() {

    }

}
