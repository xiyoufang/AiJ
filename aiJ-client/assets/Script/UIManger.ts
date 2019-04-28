import AiJCCComponent from "./AiJCCComponent";
import AsyncLock = require("async-lock");

export default class UIManger {

    /**
     * 单例
     */
    private static inst: UIManger;
    /**
     * 根节点
     */
    private root: cc.Component;
    /**
     * 当前Layer
     */
    private currentLayer: cc.Component;

    /**
     * 上一个Layer
     */
    private preLayer: cc.Component;
    /**
     * lock
     */
    private lock = new AsyncLock();

    /**
     * 获取单例
     */
    public static getInst(): UIManger {
        if (UIManger.inst == null) {
            UIManger.inst = new UIManger();
        }
        return this.inst;
    }

    /**
     * 设置跟节点
     * @param root
     */
    public setRoot(root: cc.Component): void {
        this.root = root;
    }

    /**
     * 切换层
     * @param layer
     * @param object
     * @param remove 移除之前的层
     */
    public switchLayer(layer: typeof cc.Component, object: any = {}, remove: boolean = true): void {
        this.preLayer = this.currentLayer;
        this.currentLayer = this.root.addComponent(layer);
        if (this.currentLayer instanceof AiJCCComponent) {    //若为 AiJCCComponent，则调用initAiJCom
            (<AiJCCComponent>this.currentLayer).initAiJCom(object);
        }
        if (remove) {
            this.destroyPreLayer();
        }
    }

    /**
     * 移除上一个层
     */
    public destroyPreLayer(): void {
        if (this.preLayer != null) this.preLayer.destroy(); //释放上一个的资源
        this.preLayer = null;
    }

}
