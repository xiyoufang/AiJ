export default class LoadingWindow extends fgui.Window {

    private static inst: LoadingWindow;

    private static getInst(): LoadingWindow {
        if (LoadingWindow.inst == null) {
            LoadingWindow.inst = new LoadingWindow();
        }
        return LoadingWindow.inst;
    }

    public static loading(message: string): void {
        let inst = LoadingWindow.getInst();
        inst.show();
        inst.contentPane.getChild("content").asTextField.text = message;
    }

    public static close(): void {
        let inst = LoadingWindow.getInst();
        inst.hide();
    }

    private constructor() {
        super();
    }

    protected onInit(): void {
        this.contentPane = fgui.UIPackage.createObject("commons", "LoadingWindow").asCom;
        this.center();
    }

}
