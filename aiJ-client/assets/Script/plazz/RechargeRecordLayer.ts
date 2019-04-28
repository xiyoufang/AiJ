import AiJCCComponent from "../AiJCCComponent";
import ccclass = cc._decorator.ccclass;
import UIManger from "../UIManger";
import PlazaLayer from "./PlazaLayer";
import RoomRecordEventResponse from "./response/RoomRecordEventResponse";
import RechargeRecordEventResponse from "./response/RechargeRecordEventResponse";
import * as _ from "lodash";
import HeroManager from "../hero/HeroManager";

@ccclass
export default class RechargeRecordLayer extends AiJCCComponent {

    /**
     * View
     */
    private _view: fgui.GComponent;
    /**
     * List
     */
    private _rechargeRecordList: fgui.GList;

    /**
     * 加载UI
     */
    protected onLoad(): void {
        this.loadPackage("plaza", () => {
            fgui.UIPackage.addPackage("plaza");
            this._view = fgui.UIPackage.createObject("plaza", "RechargeRecordLayer").asCom;
            this.initView();
            fgui.GRoot.inst.addChild(this._view);
        });
    }

    /**
     * UI加载完成调用初始化
     * @param objs
     */
    protected onInitAiJCom(objs: any): void {
        let rechargeRecordEventResponse = <RechargeRecordEventResponse>objs;
        _.each(rechargeRecordEventResponse.rechargeRecords, (record) => {
            let rechargeRecord = fgui.UIPackage.createObject("plaza", "RechargeRecordComponent").asCom;
            rechargeRecord.getChild("TransText").asTextField.text = record.sellerId == HeroManager.getInst().getMe().userId ? "卖" : "买";
            rechargeRecord.getChild("UserIdText").asTextField.text = _.padStart(record.sellerId == HeroManager.getInst().getMe().userId ? record.buyerId : record.sellerId, 8, "0");
            rechargeRecord.getChild("NickNameText").asTextField.text = record.sellerId == HeroManager.getInst().getMe().userId ? record.buyerName : record.sellerName;
            rechargeRecord.getChild("AssetNumberText").asTextField.text = record.quantity.toString();
            rechargeRecord.getChild("CreatedTimeText").asTextField.text = record.createdTime;
            this._rechargeRecordList.addChildAt(rechargeRecord);
        });
    }

    /**
     * 初始化视图
     */
    private initView() {
        this._view.getChild("BackButton").asButton.onClick(() => {
            this.destroy();
        }, this);
        this._rechargeRecordList = this._view.getChild("RechargeRecordList").asList;
        this._rechargeRecordList.removeChildren();
    }

    /**
     * 释放资源
     */
    protected onDestroy(): void {
        this._view.dispose();
    }
}
