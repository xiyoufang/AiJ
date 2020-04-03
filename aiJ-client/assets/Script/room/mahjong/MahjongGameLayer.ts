import ccclass = cc._decorator.ccclass;
import AiJKit from "../../ws/AiJKit";
import AppConfig from "../../AppConfig";
import * as _ from "lodash";
import MahjongOutCardEvent from "./event/MahjongOutCardEvent";
import MahjongGameEngine from "./MahjongGameEngine";
import MahjongOperateEvent from "./event/MahjongOperateEvent";
import MahjongWeaveItem from "./struct/MahjongWeaveItem";
import {MahjongWeaveType} from "./struct/MahjongWeaveType";
import Hero from "../../hero/Hero";
import * as md5 from "md5";
import SitDownTableEvent from "../event/SitDownTableEvent";
import AiJCCComponent from "../../AiJCCComponent";
import UIManger from "../../UIManger";
import PlazaLayer from "../../plazz/PlazaLayer";
import DismissVoteTableEvent from "../event/DismissVoteTableEvent";
import LeaveTableEvent from "../event/LeaveTableEvent";

@ccclass
export default class MahjongGameLayer extends AiJCCComponent {

    /**
     * UI
     */
    private _view: fgui.GComponent;
    /**
     * 南
     */
    private _southView: fgui.GComponent;
    /**
     * 东
     */
    private _eastView: fgui.GComponent;
    /**
     * 北
     */
    private _northView: fgui.GComponent;
    /**
     * 西
     */
    private _westView: fgui.GComponent;
    /**
     * 南
     */
    private _southDiscardView: fgui.GComponent;
    /**
     * 东
     */
    private _eastDiscardView: fgui.GComponent;
    /**
     * 西
     */
    private _westDiscardView: fgui.GComponent;
    /**
     * 北
     */
    private _northDiscardView: fgui.GComponent;
    /**
     * 操作层
     */
    private _operateNotifyView: fgui.GComponent;
    /**
     * 头像视图
     */
    private _headViewMap: { [key: number]: fgui.GComponent } = {};
    /**
     *
     */
    private _gameOverViewMap: { [key: number]: fgui.GComponent } = {};
    /**
     *
     */
    private _endViewMap: { [key: number]: fgui.GComponent } = {};
    /**
     * 倒计时
     */
    private _countDownText: fgui.GTextField;
    /**
     * 剩余牌
     */
    private _leftCardCountText: fgui.GTextField;
    /**
     * 剩余局数
     */
    private _leftNumberText: fgui.GTextField;
    /**
     * 投票列表
     */
    private _voteItemList: fgui.GList;
    /**
     * 引擎
     */
    private _engine: MahjongGameEngine;
    /**
     * 倒计时
     */
    private _countDown: number = 30;
    /**
     * 动画
     */
    private _mahjongOutCardBadgeAnimate: fgui.GMovieClip;

    /**
     * 加载
     */
    protected onLoad(): void {
        this.loadPackage("mahjong", () => {
                fgui.UIPackage.addPackage("mahjong");
                this._view = fgui.UIPackage.createObject("mahjong", "MahjongGameLayer").asCom;
                fgui.GRoot.inst.addChild(this._view);
                this.initView();
            }
        );
    }

    protected onInitAiJCom(objs: any): void {
        this._engine = new MahjongGameEngine(this, objs);
        this._engine.clientReady();
    }

    private initFire() {

    }


    /**
     * 释放资源
     */
    protected onDestroy(): void {
        this._engine.destroy();
        this._view.dispose();
    }

    /**
     * 初始化
     */
    private initView(): void {
        // -------------------手上的牌
        this._southView = this._view.getChild("SouthComponent").asCom;
        this._southView.removeChildren();
        this._eastView = this._view.getChild("EastComponent").asCom;
        this._eastView.removeChildren();
        this._westView = this._view.getChild("WestComponent").asCom;
        this._westView.removeChildren();
        this._northView = this._view.getChild("NorthComponent").asCom;
        this._northView.removeChildren();
        // -------------------打出的牌
        this._southDiscardView = this._view.getChild("SouthDiscardComponent").asCom;
        this._southDiscardView.removeChildren();
        this._eastDiscardView = this._view.getChild("EastDiscardComponent").asCom;
        this._eastDiscardView.removeChildren();
        this._westDiscardView = this._view.getChild("WestDiscardComponent").asCom;
        this._westDiscardView.removeChildren();
        this._northDiscardView = this._view.getChild("NorthDiscardComponent").asCom;
        this._northDiscardView.removeChildren();
        // ----
        this._operateNotifyView = this._view.getChild("OperateNotifyComponent").asCom;
        // ---- 几个数字
        this._countDownText = this._view.getChild("CountDownText").asTextField;
        this._leftCardCountText = this._view.getChild("LeftCardCountText").asTextField;
        this._leftNumberText = this._view.getChild("LeftNumberText").asTextField;
        // --- 头像
        this._headViewMap[0] = this._view.getChild("SouthHeadComponent").asCom;
        this._headViewMap[1] = this._view.getChild("EastHeadComponent").asCom;
        this._headViewMap[2] = this._view.getChild("NorthHeadComponent").asCom;
        this._headViewMap[3] = this._view.getChild("WestHeadComponent").asCom;
        // -- 结束的牌
        let gameEndGroup = this._view.getChild("GameEndGroup").asGroup;
        this._gameOverViewMap[0] = this._view.getChildInGroup("SouthGameOverItemComponent", gameEndGroup).asCom;
        this._gameOverViewMap[1] = this._view.getChildInGroup("EastGameOverItemComponent", gameEndGroup).asCom;
        this._gameOverViewMap[2] = this._view.getChildInGroup("NorthGameOverItemComponent", gameEndGroup).asCom;
        this._gameOverViewMap[3] = this._view.getChildInGroup("WestGameOverItemComponent", gameEndGroup).asCom;
        // --游戏结束
        let endGroup = this._view.getChild("EndGroup").asGroup;
        this._endViewMap[0] = this._view.getChildInGroup("SouthEndItemComponent", endGroup).asCom;
        this._endViewMap[1] = this._view.getChildInGroup("EastEndItemComponent", endGroup).asCom;
        this._endViewMap[2] = this._view.getChildInGroup("NorthEndItemComponent", endGroup).asCom;
        this._endViewMap[3] = this._view.getChildInGroup("WestEndItemComponent", endGroup).asCom;
        // --解散投票层
        let voteGroup = this._view.getChild("VoteGroup").asGroup;
        this._voteItemList = this._view.getChildInGroup("VoteItemList", voteGroup).asList;
        this._voteItemList.removeChildren();
        //下一局
        this._view.getChildInGroup("NextGameButton", gameEndGroup).asButton.onClick(() => {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new SitDownTableEvent());
        }, this);
        //按钮事件
        this._view.getChild("SitDownButton").asButton.onClick(() => {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new SitDownTableEvent());
        }, this);
        //解散按钮
        this._view.getChild("DismissVoteButton").asButton.onClick(() => {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new DismissVoteTableEvent(true));
        }, this);
        //离开
        this._view.getChild("LeaveButton").asButton.onClick(() => {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new LeaveTableEvent());
        }, this);
        // 离开
        this._view.getChildInGroup("BackButton", endGroup).asButton.onClick(() => {
            UIManger.getInst().switchLayer(PlazaLayer);
        }, this);
        this._view.getChildInGroup("VoteAgreeButton", voteGroup).asButton.onClick(() => {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new DismissVoteTableEvent(true));
        }, this);
        this._view.getChildInGroup("VoteRefuseButton", voteGroup).asButton.onClick(() => {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new DismissVoteTableEvent(false));
        }, this);
        /*
        setInterval(() => {
            if (this._countDown-- > 0) {
                this._countDownText.text = _.padStart(this._countDown.toString(10), 2, "0");
            }
        }, 1000);*/
    }

    /**
     * 游戏开始，切换场景
     */
    public renderGameStart(): void {
        this._view.getChild("SitDownButton").asButton.visible = false;
        this._view.getController("c1").setSelectedPage("playing");
    }

    /**
     * 剩余的牌
     * @param leftCardCount
     */
    public renderLeftCardCount(leftCardCount: number): void {
        this._leftCardCountText.text = _.padStart(leftCardCount.toString(10), 2, "0");
    }

    /**
     * 剩余的局数
     * @param leftNumber
     */
    public renderLeftNumber(leftNumber: number): void {
        this._leftNumberText.text = _.padStart(leftNumber.toString(10), 2, "0");
    }

    public renderDispatchCard(): void {
        this._countDown = 30;
    }

    /**
     * 显示指示灯
     * @param viewChair
     */
    public renderPilotLamp(viewChair: number): void {
        this._view.getChild("pilotLamp0").asImage.visible = false;
        this._view.getChild("pilotLamp1").asImage.visible = false;
        this._view.getChild("pilotLamp2").asImage.visible = false;
        this._view.getChild("pilotLamp3").asImage.visible = false;
        let gObject = this._view.getChild("pilotLamp" + viewChair);
        if (gObject != null)
            gObject.asImage.visible = true;
    }


    /**
     * 西
     * @param weaveItems
     * @param currCard
     * @param cards
     */
    public renderWestCard(weaveItems: Array<MahjongWeaveItem>, currCard: number = -1, cards: Array<number> = null) {
        this._westView.removeChildren();   //移除子节点 //绘制碰、杠的牌
        let y = 0;
        _.each(weaveItems, (weaveItem: MahjongWeaveItem, i: number) => {
            let _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
            let _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType.P ? "WestPengComponent" : "WestGangComponent").asCom;
            _weaveComponent.setPosition(0, y);
            y += _weaveComponent.height;
            switch (weaveItem.weaveType) {
                case MahjongWeaveType.P:
                    _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
                case MahjongWeaveType.G:
                    if (weaveItem.open) {
                        _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
                    }
                    _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
            }
            this._westView.addChild(_weaveComponent);
        });
        let cardsCount = 13 - weaveItems.length * 3;
        for (let i = 0; i < cardsCount; i++) {
            let _card = fgui.UIPackage.createObject("mahjong", "w_hand").asImage;
            if (cards != null) {
                _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
                _card.setScale(0.75, 0.75);
            }
            _card.setPosition(0, y);
            y += 60;
            _card.sortingOrder = i;
            this._westView.addChild(_card);
        }
        if (currCard != -1) {
            let _card = currCard == 0 ? fgui.UIPackage.createObject("mahjong", "w_hand").asImage :
                fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
            if (currCard != 0) {
                _card.setScale(0.75, 0.75);
            }
            _card.setPosition(0, this._westView.height - _card.height);
            this._westView.addChild(_card);
        }

    }

    /**
     * 北面
     * @param weaveItems
     * @param currCard
     * @param cards
     */
    public renderNorthCard(weaveItems: Array<MahjongWeaveItem>, currCard: number = -1, cards: Array<number> = null) {
        this._northView.removeChildren();   //移除子节点
        //绘制碰、杠的牌
        let x = this._northView.width;
        _.each(weaveItems, (weaveItem: MahjongWeaveItem, i: number) => {
            let _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
            let _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType.P ? "NorthPengComponent" : "NorthGangComponent").asCom;
            x -= _weaveComponent.width;
            _weaveComponent.setPosition(x, this._northView.height - _weaveComponent.height);
            switch (weaveItem.weaveType) {
                case MahjongWeaveType.P:
                    _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
                case MahjongWeaveType.G:
                    if (weaveItem.open) {
                        _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    }
                    _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
            }
            this._northView.addChild(_weaveComponent);
        });
        let cardsCount = 13 - weaveItems.length * 3;
        for (let i = 0; i < cardsCount; i++) {
            let _card = cards == null ? fgui.UIPackage.createObject("mahjong", "n_hand").asImage :
                fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
            x -= _card.width;
            _card.setPosition(x, this._northView.height - _card.height);
            this._northView.addChild(_card);
        }
        if (currCard != -1) {
            let _card = currCard == 0 ? fgui.UIPackage.createObject("mahjong", "n_hand").asImage :
                fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
            x -= (_card.width + 45);
            _card.setPosition(x, this._northView.height - _card.height);
            this._northView.addChild(_card);
        }
    }

    /**
     * 东面
     * @param weaveItems
     * @param currCard
     * @param cards 牌
     */
    public renderEastCard(weaveItems: Array<MahjongWeaveItem>, currCard: number = -1, cards: Array<number> = null) {
        this._eastView.removeChildren();   //移除子节点 //绘制碰、杠的牌
        let y = this._eastView.height;
        _.each(weaveItems, (weaveItem: MahjongWeaveItem, i: number) => {
            let _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
            let _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType.P ? "EastPengComponent" : "EastGangComponent").asCom;
            y -= _weaveComponent.height;
            _weaveComponent.setPosition(this._eastView.width - _weaveComponent.width, y);
            switch (weaveItem.weaveType) {
                case MahjongWeaveType.P:
                    _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
                case MahjongWeaveType.G:
                    if (weaveItem.open) {
                        _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
                    }
                    _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
            }
            this._eastView.addChild(_weaveComponent);
        });
        let cardsCount = 13 - weaveItems.length * 3;
        for (let i = 0; i < cardsCount; i++) {
            let _card = fgui.UIPackage.createObject("mahjong", "e_hand").asImage;
            if (cards != null) {
                _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
                _card.setScale(0.75, 0.75);
            }
            y -= i == 0 ? (_card.height) : 60;
            _card.setPosition(this._eastView.width - _card.width + _card.width * 0.25, y);
            _card.sortingOrder = cardsCount - i;
            this._eastView.addChild(_card);

        }
        if (currCard != -1) {
            let _card = currCard == 0 ? fgui.UIPackage.createObject("mahjong", "e_hand").asImage :
                fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
            if (currCard != 0) {
                _card.setScale(0.75, 0.75);
            }
            _card.setPosition(this._eastView.width - _card.width + _card.width * 0.25, 0);
            this._eastView.addChild(_card);
        }
    }

    /**
     * 渲染南面的牌
     * @param weaveItems
     * @param cards
     * @param currCard
     */
    public renderSouthCard(cards: Array<number>, weaveItems: Array<MahjongWeaveItem>, currCard: number = -1) {
        this._southView.removeChildren();   //移除子节点
        this._operateNotifyView.removeChildren();
        //绘制碰、杠的牌
        let x = 0;
        _.each(weaveItems, (weaveItem: MahjongWeaveItem, i: number) => {
            let _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
            let _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
            _weaveComponent.setPosition(x, this._southView.height - _weaveComponent.height);
            switch (weaveItem.weaveType) {
                case MahjongWeaveType.P:
                    _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
                case MahjongWeaveType.G:
                    if (weaveItem.open) {
                        _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    }
                    _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
            }
            x += _weaveComponent.width;
            this._southView.addChild(_weaveComponent);
        });
        _.each(cards, (card: number, i: number) => {
            let _cardHex = _.padStart(card.toString(16), 2, "0");
            let _card = fgui.UIPackage.createObject("mahjong", "SouthCardComponent").asCom;
            _card.setPosition(x + i * _card.width + (((i + 1) == cards.length && currCard != -1) ? 30 : 0), this._southView.height - _card.height);
            _card.getChild("icon").asLoader.url = fgui.UIPackage.getItemURL("mahjong", "s_handmah_" + _cardHex);
            _card.draggable = true;                             //可拖动
            _card.data = new MateData(_card.x, _card.y, card);  //记录牌的信息
            _card.on(fgui.Event.DRAG_END, (evt: fgui.Event) => {    //放弃拖拽
                let target = fgui.GObject.cast(evt.currentTarget);
                let mate = <MateData>target.data;
                if (target.y <= -100) {   //出牌操作
                    AiJKit.use(AppConfig.GAME_WS_NAME).send(new MahjongOutCardEvent(mate.value));
                    console.log("滑动出牌:" + mate.value);
                }
                target.setPosition(mate.x, mate.y); //还原位置
            }, this);
            _card.on(fgui.Event.CLICK, (evt: fgui.Event) => {
                let target = fgui.GObject.cast(evt.currentTarget);
                let mate = <MateData>target.data;
                if (mate.y == target.y) {
                    target.setPosition(mate.x, mate.y - 50);
                } else {
                    let localPos: cc.Vec2 = target.globalToLocal(evt.pos.x, evt.pos.y); //获取点击的位置
                    if (localPos.y <= 60) { //点击上部分则取消出牌，点击下部分则出牌
                        target.setPosition(mate.x, mate.y);
                    } else {                //出牌
                        AiJKit.use(AppConfig.GAME_WS_NAME).send(new MahjongOutCardEvent(mate.value));
                        console.log("点击出牌:" + mate.value);
                    }
                }
            }, this,);
            this._southView.addChild(_card);
        });
    }

    /**
     *
     * @param card  牌
     * @param hu    胡
     * @param gang  杠
     * @param peng  碰
     * @param guo   过
     * @param cards 牌
     */
    public renderOperateNotify(card: number, hu: boolean, gang: boolean, peng: boolean, guo: boolean = true, cards: Array<number> = []): void {
        this._operateNotifyView.removeChildren();
        let x = 0;
        let y = this._operateNotifyView.height;
        if (guo) {
            let button = fgui.UIPackage.createObject("mahjong", "GuoButton").asCom;
            button.setPosition(x, y - button.height);
            x += button.width + 20;
            button.data = card;  //记录牌的信息
            button.on(fgui.Event.CLICK, (evt: fgui.Event) => {
                let target = fgui.GObject.cast(evt.currentTarget);
                AiJKit.use(AppConfig.GAME_WS_NAME).send(new MahjongOperateEvent(0, target.data));
            }, this);
            this._operateNotifyView.addChild(button);
        }
        if (peng) {
            let button = fgui.UIPackage.createObject("mahjong", "PengButton").asCom;
            button.setPosition(x, y - button.height);
            x += button.width + 20;
            button.data = card;  //记录牌的信息
            button.on(fgui.Event.CLICK, (evt: fgui.Event) => {
                let target = fgui.GObject.cast(evt.currentTarget);
                AiJKit.use(AppConfig.GAME_WS_NAME).send(new MahjongOperateEvent(1, target.data));
            }, this);
            this._operateNotifyView.addChild(button);
        }
        if (gang) {
            let button = fgui.UIPackage.createObject("mahjong", "GangButton").asCom;
            button.setPosition(x, y - button.height);
            x += button.width + 20;
            button.data = card;  //记录牌的信息
            button.on(fgui.Event.CLICK, (evt: fgui.Event) => {
                let target = fgui.GObject.cast(evt.currentTarget);
                AiJKit.use(AppConfig.GAME_WS_NAME).send(new MahjongOperateEvent(2, target.data));
            }, this);
            this._operateNotifyView.addChild(button);
        }
        if (hu) {
            let button = fgui.UIPackage.createObject("mahjong", "HuButton").asCom;
            button.setPosition(x, y - button.height);
            button.data = card;  //记录牌的信息
            button.on(fgui.Event.CLICK, (evt: fgui.Event) => {
                let target = fgui.GObject.cast(evt.currentTarget);
                AiJKit.use(AppConfig.GAME_WS_NAME).send(new MahjongOperateEvent(4, target.data));
            }, this);
            this._operateNotifyView.addChild(button);
        }
    }

    /**
     * 南面出的牌
     * @param discards
     * @param isOut 是否出牌
     */
    public renderSouthDiscardCard(discards: Array<number>, isOut: boolean = false): void {
        this._southDiscardView.removeChildren();
        if (this._mahjongOutCardBadgeAnimate != null) this._mahjongOutCardBadgeAnimate.removeFromParent();
        let maxCol = 11;
        _.each(discards, (card, i) => {
            let r = parseInt((i / maxCol).toString());
            let c = i % maxCol;
            let _cardHex = _.padStart(card.toString(16), 2, "0");
            let _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
            _card.setPosition(c * _card.width, this._southDiscardView.height - (_card.height + (r * (_card.height - 26))));
            _card.sortingOrder = maxCol - r;
            this._southDiscardView.addChild(_card);
            if (isOut && i == discards.length - 1) {
                let screenPos: cc.Vec2 = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
                screenPos = screenPos.addSelf(new cc.Vec2(10, -30));
                this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
            }
        });
    }

    /**
     * 北面出的牌
     * @param discards
     * @param isOut 是否出牌
     */
    public renderNorthDiscardCard(discards: Array<number>, isOut: boolean = false): void {
        this._northDiscardView.removeChildren();
        if (this._mahjongOutCardBadgeAnimate != null) this._mahjongOutCardBadgeAnimate.removeFromParent();
        let maxCol = 11;
        _.each(discards, (card, i) => {
            let r = parseInt((i / maxCol).toString());
            let c = i % maxCol;
            let _cardHex = _.padStart(card.toString(16), 2, "0");
            let _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
            _card.setPosition(this._northDiscardView.width - (c + 1) * _card.width, r * (_card.height - 26));
            _card.sortingOrder = r;
            this._northDiscardView.addChild(_card);
            if (isOut && i == discards.length - 1) {
                let screenPos: cc.Vec2 = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
                screenPos = screenPos.addSelf(new cc.Vec2(10, -30));
                this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
            }
        });
    }

    /**
     * 东面出的牌
     * @param discards
     * @param isOut 是否出牌
     */
    public renderEastDiscardCard(discards: Array<number>, isOut: boolean = false): void {
        this._eastDiscardView.removeChildren();
        if (this._mahjongOutCardBadgeAnimate != null) this._mahjongOutCardBadgeAnimate.removeFromParent();
        let maxCol = 10;
        _.each(discards, (card, i) => {
            let r = parseInt((i / maxCol).toString());
            let c = i % maxCol;
            let _cardHex = _.padStart(card.toString(16), 2, "0");
            let _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _cardHex).asImage;
            _card.setPosition(this._eastDiscardView.width - (r + 1) * _card.width, this._eastDiscardView.height - (_card.height + c * (_card.height - 40)));
            _card.sortingOrder = maxCol - c;
            this._eastDiscardView.addChild(_card);
            if (isOut && i == discards.length - 1) {
                let screenPos: cc.Vec2 = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
                screenPos = screenPos.addSelf(new cc.Vec2(0, -20));
                this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
            }
        });
    }

    /**
     * 西面出的牌
     * @param discards
     * @param isOut 是否出牌
     */
    public renderWestDiscardCard(discards: Array<number>, isOut: boolean = false): void {
        this._westDiscardView.removeChildren();
        if (this._mahjongOutCardBadgeAnimate != null) this._mahjongOutCardBadgeAnimate.removeFromParent();
        let maxCol = 10;
        _.each(discards, (card, i) => {
            let r = parseInt((i / maxCol).toString());
            let c = i % maxCol;
            let _cardHex = _.padStart(card.toString(16), 2, "0");
            let _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _cardHex).asImage;
            _card.setPosition(r * _card.width, c * (_card.height - 40));
            _card.sortingOrder = c;
            this._westDiscardView.addChild(_card);
            if (isOut && i == discards.length - 1) {
                let screenPos: cc.Vec2 = _card.localToGlobal(cc.Vec2.ZERO.x, cc.Vec2.ZERO.y);
                screenPos = screenPos.addSelf(new cc.Vec2(40, -20));
                this.renderOutCardBadgeAnimate(screenPos.x, screenPos.y);
            }
        });
    }

    /**
     * 玩家概要信息
     * @param chair
     * @param nickName
     */
    public renderHeroSummary(chair: number, nickName: string) {
        //投票相关的信息
        let child = this._voteItemList.getChild(chair.toString());
        if (child != null) this._voteItemList.removeChild(child);
        let voteItem = fgui.UIPackage.createObject("mahjong", "VoteItemComponent").asCom;
        voteItem.getChild("NickNameText").asTextField.text = nickName;
        voteItem.getChild("VoteResultText").asTextField.text = "等待";
        this._voteItemList.addChildAt(voteItem).name = chair.toString();
    }

    /**
     * 玩家信息
     * @param view view
     * @param chair chair
     * @param hero hero
     */
    public renderHeroProfile(view: number, chair: number, hero: Hero): void {
        //各个位置的头像
        this._headViewMap[view].getChild("nickName").asTextField.text = hero.nickName;
        this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("NickNameText").asTextField.text = hero.nickName;
        this._endViewMap[view].getChild("NickNameText").asTextField.text = hero.nickName;
        this._endViewMap[view].getChild("UserIdText").asTextField.text = hero.showId;
        this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("IdText").asTextField.text = hero.showId;
        if (hero.avatar != null) {
            let md5png = "?name=" + md5(hero.avatar) + ".png";
            this._headViewMap[view].getChild("avatar").asLoader.url = hero.avatar + md5png;
            this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("Avatar").asLoader.url = hero.avatar + md5png;
            this._endViewMap[view].getChild("AvatarLoader").asLoader.url = hero.avatar + md5png;
        }
    }

    /**
     * 在线标识
     * @param view view
     * @param online
     */
    public renderOnline(view: number, online: boolean): void {
        this._headViewMap[view].getChild("OfflineImage").asImage.visible = !online;
    }

    /**
     * 坐下标识
     * @param view view
     * @param sitDown
     * @param gameStart
     */
    public renderSitDown(view: number, sitDown: boolean, gameStart: boolean): void {
        this._headViewMap[view].getChild("SitDownImage").asImage.visible = sitDown && !gameStart;
    }

    /**
     * 离开
     * @param view view
     */
    public renderLeave(view: number): void {
        this._headViewMap[view].getChild("OfflineImage").asImage.visible = false;
        this._headViewMap[view].getChild("SitDownImage").asImage.visible = false;
        this._headViewMap[view].getChild("TalkImage").asImage.visible = false;
        this._headViewMap[view].getChild("avatar").asLoader.url = "";
        this._headViewMap[view].getChild("nickName").asTextField.text = "";
        this._headViewMap[view].getChild("scoreText").asTextField.text = "";
        if (view == 0) { //自己离开
            UIManger.getInst().switchLayer(PlazaLayer); //切换到大厅
        }
    }

    /**
     * 渲染分数
     * @param view view
     * @param score score
     */
    public renderScore(view: number, score: number): void {
        this._headViewMap[view].getChild("scoreText").asTextField.text = score >= 0 ? "+" + score.toString() : score.toString();
    }

    /**
     * 游戏结束
     */
    public renderGameEndCards(view: number, weaveItems: Array<MahjongWeaveItem>, cards: Array<number>, winner: boolean, loser: boolean, currCard: number): void {
        this._view.getChild("SitDownButton").asButton.visible = true;
        this._view.getController("c1").setSelectedPage("gameEnd");
        let gameOverCardItemComponent = this._gameOverViewMap[view].getChild("GameOverCardItemComponent").asCom;
        gameOverCardItemComponent.removeChildren();
        //绘制碰、杠的牌
        let x = 0;
        _.each(weaveItems, (weaveItem: MahjongWeaveItem, i: number) => {
            let _cardHex = _.padStart(weaveItem.centerCard.toString(16), 2, "0");
            let _weaveComponent = fgui.UIPackage.createObject("mahjong", weaveItem.weaveType == MahjongWeaveType.P ? "SouthPengComponent" : "SouthGangComponent").asCom;
            _weaveComponent.setPosition(x, gameOverCardItemComponent.height - _weaveComponent.height);
            switch (weaveItem.weaveType) {
                case MahjongWeaveType.P:
                    _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
                case MahjongWeaveType.G:
                    if (weaveItem.open) {
                        _weaveComponent.getChild("n0").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n1").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                        _weaveComponent.getChild("n2").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    }
                    _weaveComponent.getChild("n3").asLoader.url = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage.resourceURL;
                    break;
            }
            x += _weaveComponent.width;
            gameOverCardItemComponent.addChild(_weaveComponent);
        });
        _.each(cards, (card: number, i: number) => {
            let _cardHex = _.padStart(card.toString(16), 2, "0");
            let _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
            _card.setPosition(x, gameOverCardItemComponent.height - _card.height);
            x += _card.width;
            gameOverCardItemComponent.addChild(_card);
        });
        if (winner) {
            let _cardHex = _.padStart(currCard.toString(16), 2, "0");
            let _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _cardHex).asImage;
            _card.setPosition(x + 30, gameOverCardItemComponent.height - _card.height);
            gameOverCardItemComponent.addChild(_card);
        }
    }

    /**
     * 游戏结束各类标记
     * @param view
     * @param info
     * @param totalScore
     * @param score
     * @param winner
     * @param banker
     */
    public renderGameEndFlag(view: number, info: string, totalScore: number, score: number, winner: boolean, banker: boolean): void {
        this._headViewMap[view].getChild("scoreText").asTextField.text = totalScore >= 0 ? "+" + totalScore.toString() : totalScore.toString();
        this._gameOverViewMap[view].getChild("winner").asImage.visible = winner;
        this._gameOverViewMap[view].getChild("InfoText").asTextField.text = info;
        this._gameOverViewMap[view].getChild("ScoreText").asTextField.text = score >= 0 ? "+" + score.toString() : score.toString();
        this._gameOverViewMap[view].getChild("GameOverHeadItemComponent").asCom.getChild("Banker").asImage.visible = banker;
        if (this._mahjongOutCardBadgeAnimate != null) this._mahjongOutCardBadgeAnimate.removeFromParent();
    }

    /**
     * 出牌的标记动画
     * @param x
     * @param y
     */
    private renderOutCardBadgeAnimate(x: number, y: number): void {
        this._mahjongOutCardBadgeAnimate = fgui.UIPackage.createObject("mahjong", "MahjongOutCardBadgeAnimate").asMovieClip;
        this._mahjongOutCardBadgeAnimate.setPosition(x, y);
        this._view.addChild(this._mahjongOutCardBadgeAnimate);
    }

    /**
     * 渲染信息
     * @param tableNo       桌号
     * @param startedTime   开始时间
     * @param endedTime     截止时间
     */
    public renderEndInfo(tableNo: number, startedTime: number, endedTime: number) {
        let endGroup = this._view.getChild("EndGroup").asGroup;
        let tableNoTpl = this._view.getChildInGroup("TableNoText", endGroup).asTextField.data;
        let timeTpl = this._view.getChildInGroup("TimeInfoText", endGroup).asTextField.data;
        this._view.getChildInGroup("TableNoText", endGroup).asTextField.text = _.template(tableNoTpl)({
            tableNo: tableNo
        });
        this._view.getChildInGroup("TimeInfoText", endGroup).asTextField.text = _.template(timeTpl)({
            startedTime: startedTime,
            endedTime: endedTime
        });
        this._view.getController("c1").setSelectedPage("end");
    }

    /**
     * 渲染结束
     * @param view
     * @param score
     * @param actionStatistic
     * @param startedTime
     * @param endedTime
     * @param tableNo
     * @param owner
     * @param distributorId
     */
    public renderEnd(view: number, score: number, actionStatistic: Array<number>, startedTime: number, endedTime: number, tableNo: number, owner: boolean, distributorId: string) {
        this._endViewMap[view].getChild("OwnerImage").asImage.visible = owner;
        this._endViewMap[view].getChild("AgentImage").asImage.visible = (distributorId != "");
        this._endViewMap[view].getChild("WinnerImage").asImage.visible = score > 0;
        this._endViewMap[view].getChild("ScoreText").asTextField.text = score >= 0 ? "+" + score.toString() : score.toString();
        this._endViewMap[view].getChild("0Text").asTextField.text = actionStatistic[0].toString();
        this._endViewMap[view].getChild("1Text").asTextField.text = actionStatistic[1].toString();
        this._endViewMap[view].getChild("2Text").asTextField.text = actionStatistic[2].toString();
        this._endViewMap[view].getChild("3Text").asTextField.text = actionStatistic[3].toString();
        this._endViewMap[view].getChild("4Text").asTextField.text = actionStatistic[4].toString();
        this._endViewMap[view].getChild("5Text").asTextField.text = actionStatistic[5].toString();
    }

    /**
     * 渲染投票
     * @param status        状态
     * @param agrees        赞同
     * @param refuses       拒绝
     * @param voteTime      投票时间
     * @param countDown     倒计时
     * @param meChair       meChair
     */
    public renderDismissVote(status: number, agrees: Array<number>, refuses: Array<number>, voteTime: string, countDown: number, meChair: number) {
        let gGroup = this._view.getChild("VoteGroup").asGroup;
        if (status == 1) {
            this._view.getChildInGroup("VoteTimeText", gGroup).asTextField.text = voteTime;
            this._view.getChildInGroup("VoteCountDownText", gGroup).asTextField.text = countDown.toString();
            this._view.getController("c1").setSelectedPage("vote");
            if (agrees != null) {
                if (_.indexOf(agrees, meChair) != -1) {
                    this._view.getChildInGroup("VoteAgreeButton", gGroup).asButton.visible = false;
                    this._view.getChildInGroup("VoteRefuseButton", gGroup).asButton.visible = false;
                }
                _.each(agrees, (chair) => {
                    this._voteItemList.getChild(chair.toString()).asCom.getChild("VoteResultText").asTextField.text = "同意";
                });
            }
            if (refuses != null) {
                if (_.indexOf(refuses, meChair) != -1) {
                    this._view.getChildInGroup("VoteAgreeButton", gGroup).asButton.visible = false;
                    this._view.getChildInGroup("VoteRefuseButton", gGroup).asButton.visible = false;
                }
                _.each(refuses, (chair) => {
                    this._voteItemList.getChild(chair.toString()).asCom.getChild("VoteResultText").asTextField.text = "拒绝";
                });
            }
        } else {
            this._view.getChildInGroup("VoteAgreeButton", gGroup).asButton.visible = true;
            this._view.getChildInGroup("VoteRefuseButton", gGroup).asButton.visible = true;
            this._view.getController("c1").setSelectedPage("playing");
            let numChildren = this._voteItemList.numChildren;
            for (let i = 0; i < numChildren; i++) {
                this._voteItemList.getChild(i.toString()).asCom.getChild("VoteResultText").asTextField.text = "等待";
            }
        }
    }

}

/**
 * 牌的原始信息
 */
class MateData {
    x: number;
    y: number;
    value: number;

    constructor(x: number, y: number, value: number) {
        this.x = x;
        this.y = y;
        this.value = value;
    }
}
