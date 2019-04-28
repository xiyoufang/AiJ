/**
 * AiJ基础组件
 */
import * as AsyncLock from "async-lock";

export default abstract class AiJCCComponent extends cc.Component {

    /**
     * 锁
     */
    private lock: AsyncLock = new AsyncLock();

    private readonly UI_LOCK_KEY: string = "ui_key";

    /**
     * 加载UI包
     * @param url
     * @param loadCb
     */
    public loadPackage(url: string, loadCb: any) {
        this.lock.acquire(this.UI_LOCK_KEY, (cb) => {
            fgui.UIPackage.loadPackage(url, () => {
                    loadCb();
                    cb();
                }
            );
        }, () => {
            console.log("Load package success!");
        });

    }

    /**
     * 初始化
     * @param objs
     */
    public initAiJCom(objs: any): void {
        this.lock.acquire(this.UI_LOCK_KEY, (cb) => {
            this.onInitAiJCom(objs);
            cb();
        }, () => {
            console.log("AiJCom init success");
        });
    };

    protected abstract onInitAiJCom(objs: any): void;

}
