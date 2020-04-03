import ccclass = cc._decorator.ccclass;
import UIManger from "../UIManger";
import AppConfig from "../AppConfig";
import RoomEvent from "../plazz/event/RoomEvent";
import FireKit from "../fire/FireKit";
import RoomServiceEventResponse from "../plazz/response/RoomServiceEventResponse";
import GameServiceManager from "../GameServiceManager";
import AlertWindow from "../AlertWindow";
import MahjongRoomConfig from "../room/mahjong/MahjongRoomConfig";
import PlazaConfig from "../plazz/PlazaConfig";
import * as _ from "lodash";
import AiJKit from "../ws/AiJKit";
import CreateTableEvent from "../room/event/CreateTableEvent";
import JoinTableEvent from "../room/event/JoinTableEvent";
import RoomLoginEventResponse from "../room/response/RoomLoginEventResponse";
import RoomRecordEvent from "./event/RoomRecordEvent";
import AiJCCComponent from "../AiJCCComponent";
import RoomRecordEventResponse from "./response/RoomRecordEventResponse";
import RoomRecordLayer from "./RoomRecordLayer";
import BroadcastEvent from "./event/BroadcastEvent";
import BroadcastEventResponse from "./response/BroadcastEventResponse";
import UserAssetEventResponse from "./response/UserAssetEventResponse";
import UserAssetEvent from "./event/UserAssetEvent";
import HeroManager from "../hero/HeroManager";
import UserInfoWindow from "../UserInfoWindow";
import UserAssetTransEvent from "./event/UserAssetTransEvent";
import UserAssetTransEventResponse from "./response/UserAssetTransEventResponse";
import RechargeRecordLayer from "./RechargeRecordLayer";
import RechargeRecordEventResponse from "./response/RechargeRecordEventResponse";
import RechargeRecordEvent from "./event/RechargeRecordEvent";
import UserCertEvent from "./event/UserCertEvent";
import {UserCertEventResponse} from "./response/UserCertEventResponse";
import SettingWindow from "../SettingWindow";

@ccclass
export default class PlazaLayer extends AiJCCComponent {

    /**
     * View
     */
    private _view: fgui.GComponent;
    /**
     * 轮询的ID
     */
    private _RoomEventInterval: number;
    /**
     * 房号
     */
    private tableNo: Array<string> = [];

    protected onLoad(): void {
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("room", this.roomCb, this);
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("room_record", this.roomRecordCb, this);
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("broadcast", this.broadcastCb, this);
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("user_asset", this.userAssetCb, this);
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("user_cert", this.userCertCb, this);
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("asset_trans", this.assetTransCb, this);
        FireKit.use(AppConfig.PLAZA_FIRE).onGroup("recharge_record", this.rechargeRecordCb, this);
        FireKit.use(AppConfig.LOCAL_FIRE).onGroup("update_table_no", this.updateTableNoCb, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("login_success", this.loginSuccessCb, this);
        this.loadPackage("plaza", () => {
            fgui.UIPackage.addPackage("plaza");
            this._view = fgui.UIPackage.createObject("plaza", "PlazaLayer").asCom;
            this.initService(); //初始化服务信息
            this.initView();
            fgui.GRoot.inst.addChild(this._view);
        });
    }

    /**
     *
     * @param objs
     */
    protected onInitAiJCom(objs: any): void {
        AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new BroadcastEvent());
        AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new UserAssetEvent(["diamond", "gold_coin", "room_card"]));
    }

    /**
     * 房间记录
     * @param response
     */
    roomRecordCb = function (response: RoomRecordEventResponse) {
        UIManger.getInst().switchLayer(RoomRecordLayer, response);
    };

    /**
     * 交易记录
     * @param response
     */
    rechargeRecordCb = function (response: RechargeRecordEventResponse) {
        UIManger.getInst().switchLayer(RechargeRecordLayer, response, false);
    };

    /**
     * 房间服务回调
     * @param response
     */
    roomCb = function (response: RoomServiceEventResponse) {
        GameServiceManager.getInst().initGameService(response.roomItems);
    };

    /**
     * 获取广播内容回调
     * @param response
     */
    broadcastCb = (response: BroadcastEventResponse) => {
        this._view.getChild("MessageText").asTextField.text = _.join(response.broadcasts, " ");
    };

    /**
     * 用户资产回调
     * @param response
     */
    userAssetCb = (response: UserAssetEventResponse) => {
        this._view.getChild("DiamondText").asTextField.text = response.assetsQuantity["diamond"].toString();    //钻石数量
    };

    /**
     * 结果
     * @param response
     */
    assetTransCb = (response: UserAssetTransEventResponse) => {
        if (response.assetCode == "diamond") {
            this._view.getChild("DiamondText").asTextField.text = response.quantity.toString();
        }
        AlertWindow.alert("提示信息", response.tips);
    };

    /**
     * 实名回调
     * @param response
     */
    userCertCb = (response: UserCertEventResponse) => {
        if (response.code == 1) {
            this._view.getChild("CertButton").asButton.visible = false;
        }
        this._view.getControllerAt(0).setSelectedIndex(0);
        AlertWindow.alert("提示信息", response.message);
    };

    /**
     * 更新房号
     */
    updateTableNoCb = (self): void => {
        self.showInputTableNo();
        if (self.tableNo.length == 6) {
            let gameServices = GameServiceManager.getInst().getGameServiceByServiceId(this.getServiceId(parseInt(_.join(this.tableNo, ""))));
            if (gameServices == null) {
                AlertWindow.alert("提示", "服务器未启动，无法进行游戏!");
                return;
            }
            new MahjongRoomConfig(gameServices.address, gameServices.port);
        }
    };

    /**
     * 通过房间号获取服务器ID
     * @param tableNo
     */
    getServiceId = (tableNo: number): number => {
        let serviceId = parseInt((tableNo / 1000).toString());
        if (serviceId < 200) {
            return serviceId;
        }
        while (serviceId > 200) {
            serviceId = serviceId - 200;
        }
        return serviceId;
    };
    /**
     * 登录成功回调
     * @param resp resp
     */
    loginSuccessCb = (resp: RoomLoginEventResponse): void => {
        let tableNo = _.join(this.tableNo, "");
        if (this.tableNo.length == 0) {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new CreateTableEvent());
        } else {
            AiJKit.use(AppConfig.GAME_WS_NAME).send(new JoinTableEvent(Number(tableNo))); //发送加入房间请求
        }
    };

    protected onDestroy(): void {
        FireKit.use(AppConfig.PLAZA_FIRE).offGroup(this);
        FireKit.use(AppConfig.LOCAL_FIRE).offGroup(this);
        FireKit.use(AppConfig.GAME_FIRE).offGroup(this);
        clearInterval(this._RoomEventInterval);
        this._view.dispose();
    }

    private initView() {
        this._view.getChild("NickNameText").asTextField.text = HeroManager.getInst().getMe().nickName;  //昵称
        this._view.getChild("UserIdText").asTextField.text = HeroManager.getInst().getMe().showId;      //用户ID
        this._view.getChild("AvatarLoader").asLoader.url = HeroManager.getInst().getMe().avatar;
        this.initDistributorView();
        this.initTransView();
        this.initTransReviewView();
        this.initCertView();
        this.initGameCreateView();
        this._view.getChild("AvatarLoader").asLoader.onClick(() => {        //点击头像
            let me = HeroManager.getInst().getMe();
            UserInfoWindow.open(me.avatar, me.address, me.nickName, me.showId, me.ip);
        }, this);
        this._view.getChild("n21").asButton.onClick(() => {
            AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new RoomRecordEvent(1, 10));
        }, this);
        this._view.getChild("SettingButton").asButton.onClick(() => {
            SettingWindow.setting(true);
        }, this);
        this._view.getChild("n4").asButton.onClick(() => { //点击创建房间
            this.tableNo = [];
            this._view.getControllerAt(0).setSelectedIndex(2);  //麻将创建界面
        }, this);
        this._view.getChild("n6").asButton.onClick(() => { //点击加入房间
            this.tableNo = [];
            FireKit.use(AppConfig.LOCAL_FIRE).emit("update_table_no", this);
            this._view.getControllerAt(0).setSelectedIndex(4);
        }, this);
        //输入房号的按钮
        for (let name of ["n13", "n14", "n15", "n16", "n17", "n18", "n19", "n20", "n21", "n22"]) {
            let numBtn = this._view.getChild("n68").asCom.getChild(name);
            numBtn.asButton.onClick(() => {
                if (this.tableNo.length < 6) {
                    this.tableNo.push(numBtn.asButton.data);
                    FireKit.use(AppConfig.LOCAL_FIRE).emit("update_table_no", this);
                }
            }, this);
        }
        //重置按钮
        this._view.getChild("n68").asCom.getChild("n24").asButton.onClick(() => {
            this.tableNo = [];
            FireKit.use(AppConfig.LOCAL_FIRE).emit("update_table_no", this);
        }, this);
        //删除按钮
        this._view.getChild("n68").asCom.getChild("n25").asButton.onClick(() => {
            this.tableNo = _.dropRight(this.tableNo);
            FireKit.use(AppConfig.LOCAL_FIRE).emit("update_table_no", this);
        }, this);
    }

    /**
     * 代理视图
     */
    private initDistributorView() {
        this._view.getChild("DistributorButton").asButton.visible = _.isString(HeroManager.getInst().getMe().distributorId) && HeroManager.getInst().getMe().distributorId.length > 0;
        this._view.getChild("DistributorButton").asButton.onClick(() => {
            this._view.getControllerAt(0).setSelectedIndex(5);
        }, this);
        let distributorGroup = this._view.getChild("distributor_group").asGroup;
        this._view.getChildInGroup("RechargeButton", distributorGroup).asButton.onClick(() => {
            this._view.getControllerAt(0).setSelectedIndex(6);
        }, this);
        this._view.getChildInGroup("RechargeRecordButton", distributorGroup).asButton.onClick(() => {
            AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new RechargeRecordEvent(1, 50, "room_card"));
        }, this);
    }

    /**
     * 初始化充值界面
     */
    private initTransView() {
        let rechargeGroup = this._view.getChild("recharge_group").asGroup;
        let rechargeReviewGroup = this._view.getChild("recharge_review_group").asGroup;
        this._view.getChildInGroup("RechargeReviewButton", rechargeGroup).asButton.onClick(() => {
            let receiveUserId = this._view.getChildInGroup("RechargeUserIdTextField", rechargeGroup).asTextField.text;
            let quantity = this._view.getChildInGroup("RechargeNumberTextField", rechargeGroup).asTextField.text;
            if (!_.isNumber(_.toNumber(quantity)) || parseInt(quantity) < 1) {
                AlertWindow.alert("提示信息", "请输入正确的数量!");
                return;
            }
            if (!_.isNumber(_.toNumber(receiveUserId)) || parseInt(receiveUserId) < 1) {
                AlertWindow.alert("提示信息", "请输入正确的玩家ID!");
                return;
            }
            this._view.getChildInGroup("RechargeAvatarLoader", rechargeReviewGroup).asLoader.url = "";
            this._view.getChildInGroup("RechargeNickNameText", rechargeReviewGroup).asTextField.text = "";
            this._view.getChildInGroup("RechargeUserIdText", rechargeReviewGroup).asTextField.text = receiveUserId;
            this._view.getChildInGroup("RechargeNumberText", rechargeReviewGroup).asTextField.text = quantity;
            this._view.getControllerAt(0).setSelectedIndex(7);
        }, this);

        this._view.getChildInGroup("RechargeCancelButton", rechargeGroup).asButton.onClick(() => {
            this._view.getControllerAt(0).setSelectedIndex(5);
        }, this);
    }

    private initTransReviewView() {
        let rechargeReviewGroup = this._view.getChild("recharge_review_group").asGroup;
        let rechargeGroup = this._view.getChild("recharge_group").asGroup;
        this._view.getChildInGroup("RechargeSubmitButton", rechargeReviewGroup).asButton.onClick(() => {
            let buyerId = this._view.getChildInGroup("RechargeUserIdTextField", rechargeGroup).asTextField.text;
            let quantity = this._view.getChildInGroup("RechargeNumberTextField", rechargeGroup).asTextField.text;
            if (!_.isNumber(_.toNumber(quantity)) || parseInt(quantity) < 1) {
                AlertWindow.alert("提示信息", "请输入正确的数量!");
                return;
            }
            if (!_.isNumber(_.toNumber(buyerId)) || parseInt(buyerId) < 1) {
                AlertWindow.alert("提示信息", "请输入正确的玩家ID!");
                return;
            }
            AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new UserAssetTransEvent("room_card", buyerId, parseInt(quantity)));
            this._view.getControllerAt(0).setSelectedIndex(5);
        }, this);
    }

    private initCertView() {
        this._view.getChild("CertButton").asButton.visible = HeroManager.getInst().getMe().certStatus == null;
        let certificationGroup = this._view.getChild("certification_group").asGroup;
        this._view.getChildInGroup("SubmitCertButton", certificationGroup).asButton.onClick(() => {
            let certNameText = this._view.getChildInGroup("CertNameTextField", certificationGroup).asTextField.text;
            let certCardText = this._view.getChildInGroup("CertCardTextField", certificationGroup).asTextField.text;
            let certMobileText = this._view.getChildInGroup("CertMobileTextField", certificationGroup).asTextField.text;
            if (certNameText.length < 2) {
                AlertWindow.alert("提示信息", "请输入正确的姓名!");
                return;
            }
            if (certCardText.length < 6) {
                AlertWindow.alert("提示信息", "请输入正确的证件号码!");
                return;
            }
            if (certMobileText.length < 6) {
                AlertWindow.alert("提示信息", "请输入正确的手机号码!");
                return;
            }
            AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new UserCertEvent(certNameText, certCardText, certMobileText, "1"));
        }, this);

    }

    private initGameCreateView(): void {
        let createGroup = this._view.getChild("create_group").asGroup;
        this._view.getChildInGroup("GameTypeList", createGroup).asList.getChild('mahjong').asButton.onClick(() => {
            this._view.getControllerAt(0).setSelectedIndex(2);  //麻将创建界面
        }, this);
        this._view.getChildInGroup("GameTypeList", createGroup).asList.getChild('poker').asButton.onClick(() => {
            this._view.getControllerAt(0).setSelectedIndex(3);  //斗地主创建界面
        }, this);
        this._view.getChildInGroup("CreateSubGameButton", createGroup).asButton.onClick(() => { //点击确定按钮
            let gameServices = GameServiceManager.getInst().randomGameService("南丰麻将");
            if (gameServices == null) {
                AlertWindow.alert("提示", "南丰麻将服务器未启动，无法进行游戏!");
            } else {
                new MahjongRoomConfig(gameServices.address, gameServices.port);
            }
        }, this);
    }

    //
    /**
     * 显示房号
     */
    private showInputTableNo(): void {
        _.each(["n31", "n32", "n33", "n34", "n35", "n36"], (name, i) => {
            if (i < this.tableNo.length) {
                this._view.getChild("n68").asCom.getChild(name).asTextField.text = this.tableNo[i];
            } else {
                this._view.getChild("n68").asCom.getChild(name).asTextField.text = "";
            }
        });
    }


    /**
     * 读取服务
     */
    private initService(): void {
        PlazaConfig.getInst()._aiJPro.send(new RoomEvent());
        this._RoomEventInterval = window.setInterval(() => {
            PlazaConfig.getInst()._aiJPro.send(new RoomEvent())
        }, 30 * 1000);  //每隔30秒自动刷新一次服务器列表
    }

}
