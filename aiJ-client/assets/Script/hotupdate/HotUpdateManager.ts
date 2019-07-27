/**
 * 热更新管理器
 */
export default class HotUpdateManager {

    private static inst: HotUpdateManager;
    /**
     * Assets Manager
     */
    private _am: any;
    /**
     * 热更新文件存储路径
     */
    private readonly _storagePath: string;

    /**
     * 构造函数
     */
    constructor() {
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWriteablePath() : "/") + "remote-asset";
        cc.log("storagePath:" + this._storagePath);
        this._am = new jsb.AssetsManager("", this._storagePath, (versionA, versionB) => {
            cc.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            let vA = versionA.split('.');
            let vB = versionB.split('.');
            for (let i = 0; i < vA.length; ++i) {
                let a = parseInt(vA[i]);
                let b = parseInt(vB[i] || 0);
                if (a != b) {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            } else {
                return 0;
            }
        });
        // this._am.setVerifyCallback();
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }
    }


    public static getInst(): HotUpdateManager {
        if (HotUpdateManager.inst == null) {
            HotUpdateManager.inst = new HotUpdateManager();
        }
        return HotUpdateManager.inst;
    }

    /**
     * 校验更新
     */
    static checkUpdate() {
        //定义热更新文件的下载目录
    }

}
