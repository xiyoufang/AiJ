import FireKit from "../../fire/FireKit";
import AppConfig from "../../AppConfig";
import MahjongGameStartEventResponse from "./response/MahjongGameStartEventResponse";
import MahjongGameStatusResponse from "./response/MahjongGameStatusResponse";
import MahjongPlayingGameSceneResponse from "./response/MahjongPlayingGameSceneResponse";
import AiJKit from "../../ws/AiJKit";
import ClientReadyEvent from "../event/ClientReadyEvent";
import MahjongGameLayer from "./MahjongGameLayer";
import * as _ from "lodash";
import MahjongDispatchCardEventResponse from "./response/MahjongDispatchCardEventResponse";
import MahjongOutCardEventResponse from "./response/MahjongOutCardEventResponse";
import MahjongOperateNotifyEventResponse from "./response/MahjongOperateNotifyEventResponse";
import MahjongOperateResultEventResponse from "./response/MahjongOperateResultEventResponse";
import MahjongWeaveItem from "./struct/MahjongWeaveItem";
import {MahjongWeaveType} from "./struct/MahjongWeaveType";
import HeroProfileEventResponse from "../response/HeroProfileEventResponse";

import HeroSceneResponse, {HeroItem} from "../response/HeroSceneResponse";
import HeroEnterEventResponse from "../response/HeroEnterEventResponse";
import HeroLeaveEventResponse from "../response/HeroLeaveEventResponse";
import HeroOfflineEventResponse from "../response/HeroOfflineEventResponse";
import HeroOnlineEventResponse from "../response/HeroOnlineEventResponse";
import HeroSitDownEventResponse from "../response/HeroSitDownEventResponse";
import HeroStandUpEventResponse from "../response/HeroStandUpEventResponse";
import HeroManager from "../../hero/HeroManager";
import HeroProfileEvent from "../event/HeroProfileEvent";
import Hero from "../../hero/Hero";
import MahjongGameEndEventResponse from "./response/MahjongGameEndEventResponse";
import MahjongEndEventResponse from "./response/MahjongEndEventResponse";
import JoinTableEventResponse from "../response/JoinTableEventResponse";
import DismissVoteEventResponse from "../response/DismissVoteEventResponse";
import AbstractRoomConfig from "../AbstractRoomConfig";

export class HeroMate {
    /**
     * 椅子
     */
    chair: number;

    /**
     * 在线状态
     */
    online: boolean;
    /**
     * 是否坐下
     */
    sitDown: boolean;
    /**
     * 名称
     */
    nickName: string;

    constructor(chair: number, online: boolean, sitDown: boolean, nickName: string) {
        this.chair = chair;
        this.online = online;
        this.sitDown = sitDown;
        this.nickName = nickName;
    }
}

export default class MahjongGameEngine {
    /**
     * 游戏UI层
     */
    private _gameLayer: MahjongGameLayer;
    /**
     * 椅子与英雄ID关系
     */
    private _heroMap: { [userId: string]: HeroMate } = {};
    /**
     * 手上的牌列表
     */
    private _cards: Array<number>;
    /**
     * 牌组合
     */
    private _weavesMap: { [key: number]: Array<MahjongWeaveItem> } = {};
    /**
     * 打去的牌列表
     */
    private _discardCardsMap: { [key: number]: Array<number> } = {};
    /**
     * 当前牌
     */
    private _currCard: number;
    /**
     * 自己的位置
     */
    private _meChair: number = -1;
    /**
     * 总数
     */
    private _chairCount: number = 4;
    /**
     * 剩余牌
     */
    private _leftCardCount: number = 0;
    /**
     * 总局数
     */
    private _totalNumber: number = 0;
    /**
     * 当前
     */
    private _currentNumber: number = 0;
    /**
     * 客户端准备好
     */
    private _clientReady: boolean = false;
    /**
     * 游戏开始状态
     */
    private _gameStart: boolean = false;
    /**
     * 加入房间事件
     */
    private _joinTableEventResponse: JoinTableEventResponse;

    constructor(gameLayer: MahjongGameLayer, objs: any) {
        this._gameLayer = gameLayer;
        this._joinTableEventResponse = objs;
        FireKit.use(AppConfig.GAME_FIRE).onGroup("game_start", this.gameStartCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("game_status", this.gameStatusCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("playing_scene", this.gamePlayingSceneCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("game_end", this.gameEndCb, this);    //单局游戏结束
        FireKit.use(AppConfig.GAME_FIRE).onGroup("dispatch_card", this.gameDispatchCardCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("out_card", this.gameOutCardCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("operate_notify", this.gameOperateNotifyCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("operate_result", this.gameOperateResultCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_profile", this.gameHeroProfileCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_scene", this.gameHeroSceneCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_enter", this.gameHeroEnterCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_leave", this.gameHeroLeaveCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_offline", this.gameHeroOfflineCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_online", this.gameHeroOnlineCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_sitDown", this.gameHeroSitDownCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("hero_standUp", this.gameHeroStandUpCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("end", this.endCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("dismiss_vote", this.dismissVoteCb, this);    //解散
    }

    public destroy(): void {
        FireKit.use(AppConfig.GAME_FIRE).offGroup(this);    //释放绑定的事件
        AbstractRoomConfig.destroyInst();                   //断开游戏服务
    }

    /**
     * 客户端准备好
     */
    clientReady = (): void => {
        this._clientReady = true;
        AiJKit.use(AppConfig.GAME_WS_NAME).send(new ClientReadyEvent());
    };

    /**
     * 解散回调
     * @param resp
     */
    dismissVoteCb = (resp: DismissVoteEventResponse): void => {
        this._gameLayer.renderDismissVote(resp.status, resp.agrees, resp.refuses, resp.voteTime, resp.countDown, this._meChair);
    };


    /**
     * 英雄掉线事件
     * @param resp
     */
    gameHeroOfflineCb = (resp: HeroOfflineEventResponse): void => {
        let heroMate = this._heroMap[resp.userId];
        heroMate.online = false;
        this.renderOnline(heroMate);
    };

    /**
     * 英雄上线事件
     * @param resp
     */
    gameHeroOnlineCb = (resp: HeroOnlineEventResponse): void => {
        let heroMate = this._heroMap[resp.userId];
        heroMate.online = true;
        this.renderOnline(heroMate);
    };
    /**
     * 英雄坐下事件
     * @param resp
     */
    gameHeroStandUpCb = (resp: HeroStandUpEventResponse): void => {
        let heroMate = this._heroMap[resp.userId];
        heroMate.sitDown = false;
        this.renderSitDown(heroMate);
    };
    /**
     * 英雄起立事件
     * @param resp
     */
    gameHeroSitDownCb = (resp: HeroSitDownEventResponse): void => {
        let heroMate = this._heroMap[resp.userId];
        heroMate.sitDown = true;
        this.renderSitDown(heroMate);
    };
    /**
     * 英雄进入事件
     * @param resp
     */
    gameHeroEnterCb = (resp: HeroEnterEventResponse): void => {
        this.heroEnter(resp.userId, resp.chair, resp.nickName);
    };
    /**
     * 离开事件
     * @param resp
     */
    gameHeroLeaveCb = (resp: HeroLeaveEventResponse): void => {
        let heroMate = this._heroMap[resp.userId];
        this.renderLeave(heroMate);
        delete this._heroMap[resp.userId];            //移除关系
    };
    /**
     *
     * @param resp
     */
    gameHeroSceneCb = (resp: HeroSceneResponse): void => {
        let heroItem = new HeroItem();
        heroItem.userId = HeroManager.getInst().getMe().userId;
        let find = _.find(resp.heroes, heroItem);
        if (find != null) {
            this._meChair = find.chair;
        }
        if (this._meChair != -1) {
            _.each(resp.heroes, (hero: HeroItem) => {
                this._heroMap[hero.userId] = new HeroMate(hero.chair, hero.online, hero.sitDown, hero.nickName);
                this.renderSitDown(this._heroMap[hero.userId]);
                this.renderOnline(this._heroMap[hero.userId]);
                this.getHeroProfile(hero.userId);
                this._gameLayer.renderHeroSummary(hero.chair, hero.nickName);   //玩家概要信息
            });
        }
    };

    /**
     * 玩家进去
     * @param userId
     * @param chair
     * @param nickName
     */
    private heroEnter(userId: string, chair: number, nickName: string): void {
        this._heroMap[userId] = new HeroMate(chair, true, false, nickName);                   //建立关系
        if (userId == HeroManager.getInst().getMe().userId) {  //确定自己的椅子
            this._meChair = chair;
        }
        this.getHeroProfile(userId);
        this._gameLayer.renderHeroSummary(chair, nickName);   //玩家概要信息
    }

    /**
     * 获取玩家信息
     * @param userId
     */
    private getHeroProfile(userId: string): void {
        if (HeroManager.getInst().getHero(userId) == null) {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new HeroProfileEvent(userId));
        } else {
            this.renderHeroProfile(HeroManager.getInst().getHero(userId));
        }
    }

    /**
     * 玩家信息
     * @param resp
     */
    gameHeroProfileCb = (resp: HeroProfileEventResponse): void => {
        let hero = new Hero(resp.userName, resp.showId, resp.userId, resp.nickName, resp.gender, resp.avatar,
            resp.distributorId, resp.address, resp.longitude, resp.latitude, resp.ip, resp.certStatus);
        HeroManager.getInst().addHero(hero);
        this.renderHeroProfile(hero);
    };

    /**
     * 离开
     * @param heroMate
     */
    private renderLeave(heroMate: HeroMate) {
        if (this._clientReady) {
            this._gameLayer.renderLeave(this.switchView(heroMate.chair));
        }
    }

    /**
     * 渲染头像
     * @param hero
     */
    private renderHeroProfile(hero: Hero) {
        if (this._clientReady) {
            this._gameLayer.renderHeroProfile(this.switchView(this._heroMap[hero.userId].chair), this._heroMap[hero.userId].chair, hero);
        }
    }

    /**
     * 在线标识
     * @param heroMate
     */
    private renderOnline(heroMate: HeroMate) {
        if (this._clientReady) {
            this._gameLayer.renderOnline(this.switchView(heroMate.chair), heroMate.online);
        }
    }

    /**
     * 在线标识
     * @param heroMate
     */
    private renderSitDown(heroMate: HeroMate) {
        if (this._clientReady) {
            this._gameLayer.renderSitDown(this.switchView(heroMate.chair), heroMate.sitDown, this._gameStart);
        }
    }

    /**
     * 游戏结束
     * @param resp
     */
    endCb = (resp: MahjongEndEventResponse): void => {
        window.setTimeout(() => {
            for (let i = 0; i < this._chairCount; i++) {
                let hero = HeroManager.getInst().getHero(this.getUserId(i));
                this._gameLayer.renderEnd(this.switchView(i), resp.score[i], resp.actionStatistics[i], resp.startedTime, resp.endedTime, resp.tableNo, hero.userId == this._joinTableEventResponse.ownerId, hero.distributorId);
            }
            this._gameLayer.renderEndInfo(resp.tableNo, resp.startedTime, resp.endedTime);
        }, 4 * 1000);
    };
    /**
     * 游戏开始
     */
    gameStartCb = (resp: MahjongGameStartEventResponse): void => {
        this._gameStart = true;
        this._gameLayer.renderGameStart();
        this._meChair = resp.chair;
        this._chairCount = resp.chairCount;
        this._cards = resp.cards;
        this._leftCardCount = resp.leftCardCount;
        this._totalNumber = resp.totalNumber;
        this._currentNumber = resp.currentNumber;
        this._gameLayer.renderLeftCardCount(this._leftCardCount);
        this._gameLayer.renderLeftNumber(this._totalNumber - this._currentNumber);
        for (let i = 0; i < resp.chairCount; i++) {         //初始化组合
            this._weavesMap[i] = [];
            this._discardCardsMap[i] = [];
            this.renderSitDown(new HeroMate(i, true, true, ""));
            let view = this.switchView(i);
            this._gameLayer.renderScore(view, resp.scores[i]);
            switch (view) {
                case 0:
                    this._gameLayer.renderSouthDiscardCard(this._discardCardsMap[i]);
                    this._gameLayer.renderSouthCard(_.clone(this._cards), this.getWeaveItems(i));   //南
                    break;
                case 1:
                    this._gameLayer.renderEastDiscardCard(this._discardCardsMap[i]);
                    this._gameLayer.renderEastCard(this.getWeaveItems(i));    //东
                    break;
                case 2:
                    this._gameLayer.renderNorthDiscardCard(this._discardCardsMap[i]);
                    this._gameLayer.renderNorthCard(this.getWeaveItems(i));   //北
                    break;
                case 3:
                    this._gameLayer.renderWestDiscardCard(this._discardCardsMap[i]);
                    this._gameLayer.renderWestCard(this.getWeaveItems(i));    //西
                    break;
            }
        }
    };

    /**
     * 游戏场景恢复
     * @param resp
     */
    gamePlayingSceneCb = (resp: MahjongPlayingGameSceneResponse): void => {
        this._gameLayer.renderGameStart();
        this._gameStart = true;
        this._meChair = resp.chair;
        this._chairCount = resp.chairCount;
        this._cards = resp.cards;
        this._leftCardCount = resp.leftCardCount;
        this._totalNumber = resp.totalNumber;
        this._currentNumber = resp.currentNumber;
        if (resp.current == this._meChair && resp.currCard != -1) { //把当前牌放到最后 resp.currCard == -1 情况表示等待操作
            let indexOf = this._cards.indexOf(resp.currCard);
            this._cards.splice(indexOf, 1);
            this._cards.push(resp.currCard);
            this._currCard = resp.currCard;
        }
        //初始化数据
        for (let i = 0; i < resp.chairCount; i++) {
            this._discardCardsMap[i] = _.slice(resp.discardCards[i], 0, resp.discardCount[i]);
            this._weavesMap[i] = resp.weaveItems[i];
            this.renderSitDown(new HeroMate(i, true, true, ""));
            let view = this.switchView(i);
            this._gameLayer.renderScore(view, resp.scores[i]);
            switch (view) {
                case 0:
                    this._gameLayer.renderSouthDiscardCard(_.clone(this._discardCardsMap[i]));
                    this._gameLayer.renderSouthCard(_.clone(this._cards), this.getWeaveItems(i), this._currCard);   //南
                    break;
                case 1:
                    this._gameLayer.renderEastDiscardCard(_.clone(this._discardCardsMap[i]));
                    this._gameLayer.renderEastCard(this.getWeaveItems(i), i == resp.current ? 0 : -1);    //东
                    break;
                case 2:
                    this._gameLayer.renderNorthDiscardCard(_.clone(this._discardCardsMap[i]));
                    this._gameLayer.renderNorthCard(this.getWeaveItems(i), i == resp.current ? 0 : -1);   //北
                    break;
                case 3:
                    this._gameLayer.renderWestDiscardCard(_.clone(this._discardCardsMap[i]));
                    this._gameLayer.renderWestCard(this.getWeaveItems(i), i == resp.current ? 0 : -1);    //西
                    break;
            }
        }
        this._gameLayer.renderLeftCardCount(this._leftCardCount);
        this._gameLayer.renderLeftNumber(this._totalNumber - this._currentNumber);
        this._gameLayer.renderPilotLamp(this.switchView(resp.current));
        if (resp.action != 0) { //显示操作
            this._gameLayer.renderOperateNotify(resp.actionCard, (resp.action & 4) != 0, (resp.action & 2) != 0, (resp.action & 1) != 0, true, resp.actionCards);
        }
    };

    /**
     * 单局游戏结束
     * @param resp
     */
    gameEndCb = (resp: MahjongGameEndEventResponse): void => {
        for (let i = 0; i < resp.chairCount; i++) {
            let currCard = _.indexOf(resp.chairs, i) != -1 ? resp.currCard : -1;    //胡牌则 currCard有效，否则无效
            if (_.indexOf(resp.chairs, resp.provider) != -1 && _.indexOf(resp.chairs, i) != -1) { //自摸则删除一张牌
                let indexOf = resp.cards[i].indexOf(currCard);
                resp.cards[i].splice(indexOf, 1);
            }
            let cards = _.clone(resp.cards[i]);    //拷贝一份用于桌面的牌展示
            if (_.indexOf(resp.chairs, i) != -1 && this.switchView(i) == 0) {   //自己方位，胡牌加一张牌
                cards.push(currCard);
            }
            switch (this.switchView(i)) {
                case 0:
                    this._gameLayer.renderSouthCard(cards, resp.weaveItems[i], currCard);
                    break;
                case 1:
                    this._gameLayer.renderEastCard(resp.weaveItems[i], currCard, cards);
                    break;
                case 2:
                    this._gameLayer.renderNorthCard(resp.weaveItems[i], currCard, cards);
                    break;
                case 3:
                    this._gameLayer.renderWestCard(resp.weaveItems[i], currCard, cards);
                    break;
            }
        }
        //resp.cards[i]

        window.setTimeout(() => {
            for (let i = 0; i < resp.chairCount; i++) {
                this._gameLayer.renderGameEndCards(this.switchView(i), resp.weaveItems[i], resp.cards[i], _.indexOf(resp.chairs, i) != -1, _.indexOf(resp.chairs, i) == -1 && resp.provider == i, resp.currCard);
                this._gameLayer.renderGameEndFlag(this.switchView(i), resp.infos[i], resp.totalScores[i], resp.scores[i], _.indexOf(resp.chairs, i) != -1, resp.banker == i);   //渲染各种标记
            }
        }, 2 * 1000);
    };

    /**
     * 发牌
     * @param resp
     */
    gameDispatchCardCb = (resp: MahjongDispatchCardEventResponse): void => {
        let weaveItems = this.getWeaveItems(resp.chair);
        if (resp.chair == this._meChair) {    //给自己发牌
            this._cards.push(resp.card);
            this._currCard = resp.card;
        }
        switch (this.switchView(resp.chair)) {
            case 0:
                this._gameLayer.renderSouthCard(_.clone(this._cards), weaveItems, this._currCard);
                break;
            case 1:
                this._gameLayer.renderEastCard(weaveItems, 0);
                break;
            case 2:
                this._gameLayer.renderNorthCard(weaveItems, 0);
                break;
            case 3:
                this._gameLayer.renderWestCard(weaveItems, 0);
                break;
        }
        this._gameLayer.renderLeftCardCount(--this._leftCardCount);
        this._gameLayer.renderDispatchCard();
        this._gameLayer.renderPilotLamp(this.switchView(resp.chair));
    };

    /**
     * 出牌
     * @param resp
     */
    gameOutCardCb = (resp: MahjongOutCardEventResponse): void => {
        let weaveItems = this.getWeaveItems(resp.chair);
        let discards = this.getDiscardCards(resp.chair);
        discards.push(resp.card);             //添加出的牌
        if (resp.chair == this._meChair) {    //给自己出牌
            let indexOf = this._cards.indexOf(resp.card); //移除打出的牌
            this._cards.splice(indexOf, 1);
            this._cards = _.sortBy(this._cards); //排序
        }
        switch (this.switchView(resp.chair)) {
            case 0:
                this._gameLayer.renderSouthDiscardCard(discards, true);
                this._gameLayer.renderSouthCard(_.clone(this._cards), weaveItems);
                break;
            case 1:
                this._gameLayer.renderEastDiscardCard(discards, true);
                this._gameLayer.renderEastCard(weaveItems);
                break;
            case 2:
                this._gameLayer.renderNorthDiscardCard(discards, true);
                this._gameLayer.renderNorthCard(weaveItems);
                break;
            case 3:
                this._gameLayer.renderWestDiscardCard(discards, true);
                this._gameLayer.renderWestCard(weaveItems);
                break;
        }
    };

    /**
     * 游戏操作通知
     * @param resp
     */
    gameOperateNotifyCb = (resp: MahjongOperateNotifyEventResponse): void => {
        if (this._meChair == resp.chair) {
            this._gameLayer.renderOperateNotify(resp.card, (resp.action & 4) != 0, (resp.action & 2) != 0, (resp.action & 1) != 0, true, resp.cards);
        }
        this._gameLayer.renderPilotLamp(-1);
    };

    /**
     * 操作结果
     * @param resp
     */
    gameOperateResultCb = (resp: MahjongOperateResultEventResponse): void => {
        let weaveItems = this.getWeaveItems(resp.chair);
        let discards = this.getDiscardCards(resp.provider);
        let count: number = 0;
        switch (resp.action) {
            case 0:     //过
                break;
            case 1:     //碰
                if (this._meChair == resp.chair) {
                    _.remove(this._cards, (card) => {
                        if (card == resp.card) return (count++ < 2);
                        return false;
                    });
                }
                if (resp.chair != resp.provider) {
                    discards = _.dropRight(discards, 1);
                    this._discardCardsMap[resp.provider] = discards;
                }
                weaveItems.push(new MahjongWeaveItem(MahjongWeaveType.P, resp.card, true, resp.provider));
                break;
            case 2:     //杠
                let foundItem = _.find(weaveItems, {centerCard: resp.card, weaveType: MahjongWeaveType.P});
                if (this._meChair == resp.chair) {
                    _.remove(this._cards, (card) => {
                        if (card == resp.card) return (count++ < ((foundItem == null) ? resp.provider != resp.chair ? 3 : 4 : 1));
                        return false;
                    });
                }
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
                break;
        }
        switch (this.switchView(resp.chair)) {
            case 0:
                this._gameLayer.renderSouthCard(_.clone(this._cards), weaveItems);
                break;
            case 1:
                this._gameLayer.renderEastCard(weaveItems);
                break;
            case 2:
                this._gameLayer.renderNorthCard(weaveItems);
                break;
            case 3:
                this._gameLayer.renderWestCard(weaveItems);
                break;
        }
        switch (this.switchView(resp.provider)) {
            case 0:
                this._gameLayer.renderSouthDiscardCard(discards);
                break;
            case 1:
                this._gameLayer.renderEastDiscardCard(discards);
                break;
            case 2:
                this._gameLayer.renderNorthDiscardCard(discards);
                break;
            case 3:
                this._gameLayer.renderWestDiscardCard(discards);
                break;
        }
        this._gameLayer.renderPilotLamp(this.switchView(resp.chair));
    };

    /**
     * 游戏状态
     * @param resp
     */
    gameStatusCb = (resp: MahjongGameStatusResponse): void => {

    };

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
    public switchView(chair: number): number {
        if (chair == -1) {
            return -1;
        }
        return (chair + this._chairCount - this._meChair) % this._chairCount;
    }

    /**
     *  视图位置切换成椅子位置
     * @param view
     */
    public switchChair(view: number): number {
        return (view + this._meChair) % this._chairCount;
    }

    /**
     * 获取UserId
     * @param chair
     */
    private getUserId(chair: number): string {
        let key = "";
        _.each(_.keys(this._heroMap), (k: string) => {
            let heroMate = this._heroMap[k];
            if (heroMate.chair == chair) {
                key = k;
            }
        });
        return key;
    }

    /**
     * 获取 HeroMate
     * @param chair
     */
    private getHeroMate(chair: number): HeroMate {
        return this._heroMap[this.getUserId(chair)];
    }


}
