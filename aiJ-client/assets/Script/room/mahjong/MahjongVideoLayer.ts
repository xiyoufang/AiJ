import md5 = require("md5");
import ccclass = cc._decorator.ccclass;
import AiJCCComponent from "../../AiJCCComponent";
import MahjongRecord from "./record/MahjongRecord";
import MahjongPlayerRecord from "./record/MahjongPlayerRecord";
import MahjongGameRecord from "./record/MahjongGameRecord";
import * as _ from "lodash";
import HeroManager from "../../hero/HeroManager";
import MahjongWeaveItem from "./struct/MahjongWeaveItem";
import {MahjongWeaveType} from "./struct/MahjongWeaveType";
import {MahjongAction} from "./record/MahjongAction";
import MahjongGameActionRecord from "./record/MahjongGameActionRecord";

/**
 * 回放
 */
@ccclass
export default class MahjongVideoLayer extends AiJCCComponent {

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
     * 倒计时
     */
    private _countDownText: fgui.GTextField;
    /**
     * 头像视图
     */
    private _headViewMap: { [key: number]: fgui.GComponent } = {};
    /**
     * 玩家信息
     */
    private _mahjongPlayerRecords: Array<MahjongPlayerRecord>;
    /**
     * 游戏信息
     */
    private _mahjongGameRecord: MahjongGameRecord;
    /**
     * 自己的位置
     */
    private _meChair: number;
    /**
     * 总数
     */
    private _chairCount: number;
    /**
     * 每个人的牌
     */
    private _chairCards: { [key: number]: Array<number> } = {};
    /**
     * 牌组合
     */
    private _weavesMap: { [key: number]: Array<MahjongWeaveItem> } = {};
    /**
     * 打去的牌列表
     */
    private _discardCardsMap: { [key: number]: Array<number> } = {};
    /**
     * 当前播放的位置
     */
    private _currentIndex: number = 0;
    /**
     * 当前牌
     */
    private _currCard: number = -1;
    /**
     * 动画
     */
    private _mahjongOutCardBadgeAnimate: fgui.GMovieClip;
    /**
     * 超时出牌
     */
    private _timeout: number = 1000;
    /**
     * Fn Id
     */
    private _timeoutFnId: number = -1;

    /**
     * 加载
     */
    protected onLoad(): void {
        this.loadPackage("mahjong", () => {
                fgui.UIPackage.addPackage("mahjong");
                this._view = fgui.UIPackage.createObject("mahjong", "MahjongVideoLayer").asCom;
                fgui.GRoot.inst.addChild(this._view);
                this.initView();
            }
        );
    }

    protected onInitAiJCom(objs: any): void {
        let mahjongRecord = <MahjongRecord>JSON.parse(objs["detail"]);
        this._mahjongGameRecord = mahjongRecord.mahjongGameRecords[parseInt(objs["index"])];
        this._mahjongPlayerRecords = mahjongRecord.mahjongPlayerRecords;
        this._chairCount = this._mahjongPlayerRecords.length;
        this._meChair = this.getMeChair();
        this.renderHead();
        this.renderGameStart();
        this.playRecord();
    }

    /**
     * 播放
     */
    private playRecord() {
        let length = this._mahjongGameRecord.mahjongGameActionRecords.length;
        this._countDownText.text = _.padStart((length - this._currentIndex - 1).toString(), 2, "0");
        let resp = this._mahjongGameRecord.mahjongGameActionRecords[this._currentIndex];
        console.log(JSON.stringify(resp));
        let timeout = this._timeout;
        switch (resp.mahjongAction) {
            case MahjongAction.DISPATCH:
                this.dispatchCard(resp);
                break;
            case MahjongAction.NOTIFY:
                break;
            case MahjongAction.OUT:
                this.outCard(resp);
                break;
            case MahjongAction.N:
                break;
            case MahjongAction.P:
                this.operateCard(1, resp);
                break;
            case MahjongAction.G:
                this.operateCard(2, resp);
                break;
            case MahjongAction.H:
                this.operateCard(4, resp);
                break;
            default:
                break;
        }

        if (++this._currentIndex < length) {
            this._timeoutFnId = window.setTimeout(() => {
                this.playRecord();
            }, timeout);
        }

    }

    /**
     * 释放资源
     */
    protected onDestroy(): void {
        this._view.dispose();
    }

    /**
     * 初始化视图
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
        // --- 头像
        this._headViewMap[0] = this._view.getChild("SouthHeadComponent").asCom;
        this._headViewMap[1] = this._view.getChild("EastHeadComponent").asCom;
        this._headViewMap[2] = this._view.getChild("NorthHeadComponent").asCom;
        this._headViewMap[3] = this._view.getChild("WestHeadComponent").asCom;
        // --- 倒计时
        this._countDownText = this._view.getChild("CountDownText").asTextField;
        //按钮事件
        this._view.getChild("BackwardButton").asButton.onClick(() => {  //减速
            if (this._timeout < 4000) {
                this._timeout += 100;
            }
        }, this);
        this._view.getChild("PauseButton").asButton.onClick(() => {     //暂停
            if (this._timeoutFnId == -1) {
                this._view.getChild("PauseButton").asButton.icon = fgui.UIPackage.getItemURL("mahjong", "rec_pause");
                this.playRecord();
            } else {
                window.clearTimeout(this._timeoutFnId);
                this._view.getChild("PauseButton").asButton.icon = fgui.UIPackage.getItemURL("mahjong", "rec_play");
                this._timeoutFnId = -1;
            }
        }, this);
        this._view.getChild("ForwardButton").asButton.onClick(() => {   //加速
            if (this._timeout > 300) {
                this._timeout -= 100;
            }
        }, this);
        this._view.getChild("ExitButton").asButton.onClick(() => {      //退出
            if (this._timeoutFnId != -1) {
                window.clearTimeout(this._timeoutFnId);
            }
            this.destroy(); //摧毁
        }, this);
    }

    /**
     * 渲染头像
     */
    private renderHead() {
        _.each(this._mahjongPlayerRecords, (mahjongPlayerRecord, i) => {
            this._headViewMap[i].getChild("nickName").asTextField.text = mahjongPlayerRecord.nickName;
            if (mahjongPlayerRecord.avatar != null) {
                let md5png = "?name=" + md5(mahjongPlayerRecord.avatar) + ".png";
                this._headViewMap[i].getChild("avatar").asLoader.url = mahjongPlayerRecord.avatar + md5png;
            }
        });
    }

    /**
     * 游戏开始
     */
    private renderGameStart() {
        _.each(this._mahjongGameRecord.mahjongGameStartRecord, (mahjongPlayerRecord, i) => {
            switch (this.switchView(i)) {
                case 0:
                    this.renderSouthCard(mahjongPlayerRecord.cards, []);
                    break;
                case 1:
                    this.renderEastCard(mahjongPlayerRecord.cards, []);
                    break;
                case 2:
                    this.renderNorthCard(mahjongPlayerRecord.cards, []);
                    break;
                case 3:
                    this.renderWestCard(mahjongPlayerRecord.cards, []);
                    break;

            }
            this._chairCards[i] = mahjongPlayerRecord.cards;
        });
    }

    /**
     * 南
     * @param cards
     * @param weaveItems
     * @param currCard
     */
    private renderSouthCard(cards: Array<number>, weaveItems: Array<MahjongWeaveItem>, currCard: number = -1) {
        this._southView.removeChildren();   //移除子节点
        let x = 0;        //绘制碰、杠的牌
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
            let _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
            _card.setPosition(x + i * _card.width + (((i + 1) == cards.length && currCard != -1) ? 30 : 0), this._southView.height - _card.height);
            this._southView.addChild(_card);
        });
    }

    /**
     * 东
     * @param cards
     * @param weaveItems
     * @param currCard
     */
    private renderEastCard(cards: Array<number> = null, weaveItems: Array<MahjongWeaveItem>, currCard: number = -1) {
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
            let _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
            _card.setScale(0.75, 0.75);
            y -= i == 0 ? (_card.height) : 60;
            _card.setPosition(this._eastView.width - _card.width + _card.width * 0.25, y);
            _card.sortingOrder = cardsCount - i;
            this._eastView.addChild(_card);
        }
        if (currCard != -1) {
            let _card = fgui.UIPackage.createObject("mahjong", "e_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
            _card.setScale(0.75, 0.75);
            _card.setPosition(this._eastView.width - _card.width + _card.width * 0.25, 0);
            this._eastView.addChild(_card);
        }
    }

    /**
     * 南
     * @param cards
     * @param weaveItems
     * @param currCard
     */
    private renderNorthCard(cards: Array<number> = null, weaveItems: Array<MahjongWeaveItem>, currCard: number = -1) {
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
            let _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
            x -= _card.width;
            _card.setPosition(x, this._northView.height - _card.height);
            this._northView.addChild(_card);
        }
        if (currCard != -1) {
            let _card = fgui.UIPackage.createObject("mahjong", "s_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
            x -= (_card.width + 45);
            _card.setPosition(x, this._northView.height - _card.height);
            this._northView.addChild(_card);
        }
    }

    /**
     * 西
     * @param cards
     * @param weaveItems
     * @param currCard
     */
    private renderWestCard(cards: Array<number> = null, weaveItems: Array<MahjongWeaveItem>, currCard: number = -1) {
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
            let _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(cards[i].toString(16), 2, "0")).asImage;
            _card.setScale(0.75, 0.75);
            _card.setPosition(0, y);
            y += 60;
            _card.sortingOrder = i;
            this._westView.addChild(_card);
        }
        if (currCard != -1) {
            let _card = fgui.UIPackage.createObject("mahjong", "w_mingmah_" + _.padStart(currCard.toString(16), 2, "0")).asImage;
            _card.setScale(0.75, 0.75);
            _card.setPosition(0, this._westView.height - _card.height);
            this._westView.addChild(_card);
        }
    }

    /**
     * 获取组合
     * @param chair
     */
    private getWeaveItems(chair: number): Array<MahjongWeaveItem> {
        if (this._weavesMap[chair] == undefined) this._weavesMap[chair] = new Array<MahjongWeaveItem>();
        return this._weavesMap[chair];
    }

    /**
     * 获取出的牌
     * @param chair
     */
    private getDiscardCards(chair: number): Array<number> {
        if (this._discardCardsMap[chair] == undefined) this._discardCardsMap[chair] = new Array<number>();
        return this._discardCardsMap[chair];
    }

    /**
     * 椅子位置切换成视图位置
     * @param chair
     */
    private switchView(chair: number): number {
        if (chair == -1) {
            return -1;
        }
        return (chair + this._chairCount - this._meChair) % this._chairCount;
    }

    /**
     *  视图位置切换成椅子位置
     * @param view
     */
    private switchChair(view: number): number {
        return (view + this._meChair) % this._chairCount;
    }

    /**
     * getMeChair
     */
    private getMeChair(): number {
        this._meChair = 0;
        _.each(this._mahjongPlayerRecords, (mahjongPlayerRecord, i) => {
            if (HeroManager.getInst().getMe().userId == mahjongPlayerRecord.userId) {
                this._meChair = i;
            }
        });
        return this._meChair;
    }

    /**
     * 碰牌
     * @param type
     * @param resp
     */
    private operateCard(type: number, resp: MahjongGameActionRecord) {
        let weaveItems = this.getWeaveItems(resp.chair);
        let discards = this.getDiscardCards(resp.provider);
        let count: number = 0;
        switch (type) {
            case 0:     //过
                break;
            case 1:     //碰
                _.remove(this._chairCards[resp.chair], (card) => {
                    if (card == resp.card) return (count++ < 2);
                    return false;
                });
                if (resp.chair != resp.provider) {
                    discards = _.dropRight(discards, 1);
                    this._discardCardsMap[resp.provider] = discards;
                }
                weaveItems.push(new MahjongWeaveItem(MahjongWeaveType.P, resp.card, true, resp.provider));
                break;
            case 2:     //杠
                let foundItem = _.find(weaveItems, {centerCard: resp.card, weaveType: MahjongWeaveType.P});
                _.remove(this._chairCards[resp.chair], (card) => {
                    if (card == resp.card) return (count++ < ((foundItem == null) ? 3 : 1));
                    return false;
                });
                if (resp.chair != resp.provider) {
                    discards = _.dropRight(discards, 1);
                    this._discardCardsMap[resp.provider] = discards;
                }
                if (foundItem == null) {
                    weaveItems.push(new MahjongWeaveItem(MahjongWeaveType.G, resp.card, resp.provider != resp.chair, resp.provider));
                } else {
                    foundItem.weaveType = MahjongWeaveType.G;
                }
                break;
            case 4:     //胡
                return;
        }
        switch (this.switchView(resp.chair)) {
            case 0:
                this.renderSouthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
            case 1:
                this.renderEastCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
            case 2:
                this.renderNorthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
            case 3:
                this.renderWestCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
        }
        switch (this.switchView(resp.provider)) {
            case 0:
                this.renderSouthDiscardCard(discards);
                break;
            case 1:
                this.renderEastDiscardCard(discards);
                break;
            case 2:
                this.renderNorthDiscardCard(discards);
                break;
            case 3:
                this.renderWestDiscardCard(discards);
                break;
        }
    }

    /**
     * 发牌
     * @param resp
     */
    private dispatchCard(resp: MahjongGameActionRecord) {
        let weaveItems = this.getWeaveItems(resp.chair);
        this._chairCards[resp.chair].push(resp.card);
        this._currCard = resp.card;
        switch (this.switchView(resp.chair)) {
            case 0:
                this.renderSouthCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
                break;
            case 1:
                this.renderEastCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
                break;
            case 2:
                this.renderNorthCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
                break;
            case 3:
                this.renderWestCard(_.clone(this._chairCards[resp.chair]), weaveItems, this._currCard);
                break;
        }
    }

    /**
     * 出牌
     * @param resp
     */
    private outCard(resp: MahjongGameActionRecord) {
        let weaveItems = this.getWeaveItems(resp.chair);
        let discards = this.getDiscardCards(resp.chair);
        discards.push(resp.card);             //添加出的牌
        let indexOf = this._chairCards[resp.chair].indexOf(resp.card); //移除打出的牌
        this._chairCards[resp.chair].splice(indexOf, 1);
        this._chairCards[resp.chair] = _.sortBy(this._chairCards[resp.chair]); //排序
        switch (this.switchView(resp.chair)) {
            case 0:
                this.renderSouthDiscardCard(discards, true);
                this.renderSouthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
            case 1:
                this.renderEastDiscardCard(discards, true);
                this.renderEastCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
            case 2:
                this.renderNorthDiscardCard(discards, true);
                this.renderNorthCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
            case 3:
                this.renderWestDiscardCard(discards, true);
                this.renderWestCard(_.clone(this._chairCards[resp.chair]), weaveItems);
                break;
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
     * 出牌的标记动画
     * @param x
     * @param y
     */
    private renderOutCardBadgeAnimate(x: number, y: number): void {
        this._mahjongOutCardBadgeAnimate = fgui.UIPackage.createObject("mahjong", "MahjongOutCardBadgeAnimate").asMovieClip;
        this._mahjongOutCardBadgeAnimate.setPosition(x, y);
        this._view.addChild(this._mahjongOutCardBadgeAnimate);
    }

}
