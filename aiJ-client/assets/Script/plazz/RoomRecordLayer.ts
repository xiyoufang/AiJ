import AiJCCComponent from "../AiJCCComponent";
import ccclass = cc._decorator.ccclass;
import RoomRecordEventResponse, {
    RoomRecord,
    RoomRecordSummary
} from "./response/RoomRecordEventResponse";
import * as _ from "lodash";
import UIManger from "../UIManger";
import PlazaLayer from "./PlazaLayer";
import MahjongVideoLayer from "../room/mahjong/MahjongVideoLayer";

@ccclass
export default class RoomRecordLayer extends AiJCCComponent {

    /**
     * View
     */
    private _view: fgui.GComponent;
    /**
     * 记录列表
     */
    private _roomRecordList: fgui.GList;
    /**
     * 房间详细记录
     */
    private _roomRecordItemList: fgui.GList;
    /**
     * 当前记录
     */
    private _currRoomRecord: RoomRecord;

    /**
     * 加载UI
     */
    protected onLoad(): void {
        this.loadPackage("plaza", () => {
            fgui.UIPackage.addPackage("plaza");
            this._view = fgui.UIPackage.createObject("plaza", "RoomRecordLayer").asCom;
            this.initView();
            fgui.GRoot.inst.addChild(this._view);
        });
    }

    /**
     * UI加载完成调用初始化
     * @param objs
     */
    protected onInitAiJCom(objs: any): void {
        let roomRecordEventResponse = <RoomRecordEventResponse>objs;
        _.each(roomRecordEventResponse.roomRecords, (record) => {
            let roomRecord = fgui.UIPackage.createObject("plaza", "RoomRecordComponent").asCom;
            roomRecord.getChild("ServiceNameText").asTextField.text = record.serviceName;
            roomRecord.getChild("TableNoText").asTextField.text = record.tableNo.toString();
            roomRecord.getChild("NickNameText").asTextField.text = record.nickName;
            roomRecord.getChild("ScoreText").asTextField.text = (record.score >= 0 ? "+" : "") + record.score.toString();
            roomRecord.getChild("StartedTimeText").asTextField.text = record.startedTime;
            roomRecord.getChild("DetailButton").asButton.data = record;
            roomRecord.getChild("DetailButton").asButton.onClick((evt: fgui.Event) => {
                this._roomRecordItemList.removeChildren();
                let target = fgui.GObject.cast(evt.currentTarget);
                this._currRoomRecord = target.data;
                let summaries = <Array<Array<RoomRecordSummary>>>JSON.parse(this._currRoomRecord.summary);
                _.each(summaries, (summary, i) => {                 //循环局数
                    let roomRecordItem = fgui.UIPackage.createObject("plaza", "RoomRecordItemComponent").asCom;
                    roomRecordItem.getChild("NumberText").asTextField.text = (i + 1).toString();
                    roomRecordItem.getChild("PlayVideoButton").asButton.data = {
                        index: i,
                        detail: this._currRoomRecord.detail
                    };
                    roomRecordItem.getChild("PlayVideoButton").asButton.onClick((evt: fgui.Event) => { //播放回放
                        let data = fgui.GObject.cast(evt.currentTarget).data;
                        UIManger.getInst().switchLayer(MahjongVideoLayer, data, false)
                    }, this);
                    let roomRecordItemScoreList = roomRecordItem.getChild("RoomRecordItemScoreList").asList;
                    roomRecordItemScoreList.removeChildren();
                    _.each(summary, (roomRecordSummary, ii) => {   //循环玩家
                        let roomRecordItemScore = fgui.UIPackage.createObject("plaza", "RoomRecordItemScoreComponent").asCom;
                        roomRecordItemScore.getChild("NickNameText").asTextField.text = roomRecordSummary.nickName;
                        roomRecordItemScore.getChild("ScoreText").asTextField.text = (roomRecordSummary.score >= 0 ? "+" : "") + roomRecordSummary.score;
                        roomRecordItemScoreList.addChildAt(roomRecordItemScore);
                    });
                    this._roomRecordItemList.addChildAt(roomRecordItem);
                });
                this._view.getController("c1").setSelectedIndex(1);
            }, this);
            this._roomRecordList.addChildAt(roomRecord);
        });
    }

    /**
     * 初始化视图
     */
    private initView() {
        this._view.getChild("BackButton").asButton.onClick(() => {
            UIManger.getInst().switchLayer(PlazaLayer);
        }, this);
        this._roomRecordList = this._view.getChild("RoomRecordList").asList;
        this._roomRecordItemList = this._view.getChildInGroup("RoomRecordItemList", this._view.getChild("RoomRecordItemGroup").asGroup).asList;
        this._roomRecordList.removeChildren();
    }

    /**
     * 释放资源
     */
    protected onDestroy(): void {
        this._view.dispose();
    }
}
