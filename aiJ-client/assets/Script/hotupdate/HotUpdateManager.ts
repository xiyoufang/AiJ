/**
 * 热更新管理器
 */
import TextAsset = cc.TextAsset;
import AlertWindow from "../AlertWindow";

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
     * 本地的项目资源文件
     */
    private _localManifest: any;
    /**
     * 更新状态
     */
    private _updating: boolean = false;
    /**
     * 重试状态
     */
    private _canRetry: boolean = false;
    /**
     * 回调函数
     */
    private _callback: any;

    /**
     * 获取实例
     */
    public static getInst(): HotUpdateManager {
        if (HotUpdateManager.inst == null) {
            HotUpdateManager.inst = new HotUpdateManager();
        }
        return HotUpdateManager.inst;
    }

    /**
     * 构造函数
     */
    constructor() {
        this._storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote-asset";
        cc.log("storagePath:" + this._storagePath);
        this._am = new jsb.AssetsManager('', this._storagePath, (versionA, versionB) => {
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
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            this._am.setMaxConcurrentTask(2);
        }
    }

    /**
     * 校验版本
     */
    public checkAndUpdate(callback) {
        if (this._updating) { //正在更新
            cc.log('Checking or updating ...');
            return;
        }
        this._callback = callback;
        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            cc.log("load project.manifest");
            cc.loader.loadRes("project", (err, res) => {
                cc.log(res._$nativeAsset);
                let manifest = new jsb.Manifest(res._$nativeAsset, this._storagePath);
                this._am.loadLocalManifest(manifest, this._storagePath);
                if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
                    cc.log('Failed to load local manifest ...');
                    AlertWindow.alert("出错了", "加载本地的manifest文件失败,请重新安装客户端.");
                    return;
                }
                this._am.setEventCallback(this.checkCb.bind(this));
                this._am.checkUpdate();
                this._updating = true;
            });
        }
    }

    /**
     * 校验版本回调
     * @param event
     */
    public checkCb(event) {
        cc.log('checkCb Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log("No local manifest file found, hot update skipped.");
                AlertWindow.alert("出错了", "加载本地的manifest文件失败,更新失败.");
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log("Fail to download manifest file, hot update skipped.");
                AlertWindow.alert("出错了", "下载manifest文件失败,更新失败.");
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("Already up to date with the latest remote version.");
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log('New version found, please try to update.');
                //发现新版本
                this._callback({'code': 0});
                this._am.setEventCallback(this.updateCb.bind(this));
                this._am.update();
                this._updating = true;
                cc.log('call update.');
                break;
            default:
                return;
        }
        this._updating = false;
    }

    /**
     * 升级回调
     * @param event
     */
    public updateCb(event) {
        var needRestart = false;
        var failed = false;
        cc.log('updateCb Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log("No local manifest file found, hot update skipped.");
                AlertWindow.alert("出错了", "加载本地的manifest文件失败,更新失败.");
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                this._callback({'code': 1, 'downloaded': event.getDownloadedFiles(), 'total': event.getTotalFiles()});
                cc.log("downloaded:" + event.getDownloadedFiles() + ' / ' + event.getTotalFiles());
                var msg = event.getMessage();
                if (msg) {
                    cc.log('Updated file: ' + msg);
                }
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log("Fail to download manifest file, hot update skipped.");
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log("Already up to date with the latest remote version.");
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log("Update finished. " + event.getMessage());
                this._callback({'code': 2});
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log('Update failed. ' + event.getMessage());
                this._updating = false;
                this._canRetry = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                cc.log('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage());
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                cc.log(event.getMessage());
                break;
            default:
                break;
        }

        if (failed) {
            this._am.setEventCallback(null);
            this._updating = false;
        }

        if (needRestart) {
            this._am.setEventCallback(null);
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);
            cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);
            cc.audioEngine.stopAll();
            cc.game.restart();
        }
    }
}
