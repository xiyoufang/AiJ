import UIManger from "./UIManger";
import WelcomeLayer from "./WelcomeLayer";
import Setting from "./Setting";

export default class SettingWindow extends fgui.Window {

    private static inst: SettingWindow;

    private static getInst(): SettingWindow {
        if (SettingWindow.inst == null) {
            SettingWindow.inst = new SettingWindow();
        }
        return SettingWindow.inst;
    }

    public static setting(account: boolean = false): void {
        let inst = SettingWindow.getInst();
        inst.show();
        inst.contentPane.getChild("AccountGroup").asGroup.visible = account;
    }

    private constructor() {
        super();
    }

    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("commons", "SettingWindow").asCom;
        let asGroup = this.contentPane.getChild("AccountGroup").asGroup;
        this.contentPane.getChildInGroup("AccountToggleButton", asGroup).asButton.onClick(() => {
            cc.sys.localStorage.setItem("user", "");      //清除登录信息
            UIManger.getInst().switchLayer(WelcomeLayer);   //登录界面
        }, this);
        this.contentPane.getChildInGroup("ExitGameButton", asGroup).asButton.onClick(() => {
            cc.director.end();
        }, this);
        this.contentPane.getChild("MusicToggleButton").asButton.selected = Setting.getMusic();
        this.contentPane.getChild("SoundToggleButton").asButton.selected = Setting.getSound();
        this.contentPane.getChild("MusicToggleButton").asButton.onClick(() => {
            Setting.setMusic(this.contentPane.getChild("MusicToggleButton").asButton.selected);
        }, this);
        this.contentPane.getChild("SoundToggleButton").asButton.onClick(() => {
            Setting.setSound(this.contentPane.getChild("SoundToggleButton").asButton.selected);
        }, this);
        this.center();
    }

}
