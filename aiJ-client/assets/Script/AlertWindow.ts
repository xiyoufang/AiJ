
export default class AlertWindow extends fgui.Window {

    private static inst: AlertWindow;

    private static getInst(): AlertWindow {
        if (AlertWindow.inst == null) {
            AlertWindow.inst = new AlertWindow();
        }
        return AlertWindow.inst;
    }

    public static alert(title: string, message: string): void {
        let inst = AlertWindow.getInst();
        inst.show();
        inst.contentPane.getChild("title").asTextField.text = title;
        inst.contentPane.getChild("content").asTextField.text = message;
    }

    private constructor() {
        super();
    }

    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("commons", "AlertWindow").asCom;
        this.center();
    }

}
