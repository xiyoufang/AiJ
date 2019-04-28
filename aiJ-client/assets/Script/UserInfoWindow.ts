import * as _ from "lodash";

export default class UserInfoWindow extends fgui.Window {

    private static inst: UserInfoWindow;

    private static getInst(): UserInfoWindow {
        if (UserInfoWindow.inst == null) {
            UserInfoWindow.inst = new UserInfoWindow();
        }
        return UserInfoWindow.inst;
    }

    /**
     * 打开 用户头像信息
     * @param url
     * @param address
     * @param nickName
     * @param id
     * @param ip
     */
    public static open(url: string, address: string, nickName: string, id: string, ip: string): void {
        let inst = UserInfoWindow.getInst();
        inst.show();
        inst.contentPane.getChild("UserAddressText").asTextField.text = address; //
        inst.contentPane.getChild("NickNameText").asTextField.text = nickName;
        inst.contentPane.getChild("UserIdText").asTextField.text = _.padStart(id, 8, "0");
        inst.contentPane.getChild("UserIpText").asTextField.text = ip;
        inst.contentPane.getChild("AvatarLoader").asLoader.url = url;

    }

    private constructor() {
        super();
    }

    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("commons", "UserInfoWindow").asCom;
        this.center();
    }

}
