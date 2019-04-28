import AiJKit from "../../ws/AiJKit";
import FireKit from "../../fire/FireKit";
import RoomLoginResponseHandler from "../handler/RoomLoginResponseHandler";
import LoginNotifyResponseHandler from "../handler/LoginNotifyResponseHandler";
import RoomMobileLoginEvent from "../event/RoomMobileLoginEvent";
import AppConfig from "../../AppConfig";
import CreateTableEventResponse from "../response/CreateTableEventResponse";
import CreateTableEventResponseHandler from "../handler/CreateTableEventResponseHandler";
import JoinTableEvent from "../event/JoinTableEvent";
import JoinTableEventResponseHandler from "../handler/JoinTableEventResponseHandler";
import JoinTableEventResponse from "../response/JoinTableEventResponse";
import UIManger from "../../UIManger";
import MahjongGameLayer from "./MahjongGameLayer";
import RoomWsListener from "../RoomWsListener";
import HeroOnlineEventResponseHandler from "../handler/HeroOnlineEventResponseHandler";
import HeroEnterEventResponseHandler from "../handler/HeroEnterEventResponseHandler";
import HeroLeaveEventResponseHandler from "../handler/HeroLeaveEventResponseHandler";
import HeroOfflineEventResponseHandler from "../handler/HeroOfflineEventResponseHandler";
import HeroSitDownEventResponseHandler from "../handler/HeroSitDownEventResponseHandler";
import HeroStandUpEventResponseHandler from "../handler/HeroStandUpEventResponseHandler";
import HeroSceneResponseHandler from "../handler/HeroSceneResponseHandler";
import ChatEventResponseHandler from "../handler/ChatEventResponseHandler";
import RoomCommonResponseHandler from "../handler/RoomCommonResponseHandler";
import MahjongGameStartResponseHandler from "./handler/MahjongGameStartResponseHandler";
import MahjongGameStatusResponseHandler from "./handler/MahjongGameStatusResponseHandler";
import MahjongPlayingGameSceneResponseHandler from "./handler/MahjongPlayingGameSceneResponseHandler";
import MahjongDispathCardResponseHandler from "./handler/MahjongDispathCardResponseHandler";
import MahjongOutCardResponseHandler from "./handler/MahjongOutCardResponseHandler";
import MahjongOperateNotifyEventResponseHandler from "./handler/MahjongOperateNotifyEventResponseHandler";
import MahjongOperateResultEventResponseHandler from "./handler/MahjongOperateResultEventResponseHandler";
import MahjongErrorEventResponseHandler from "./handler/MahjongErrorEventResponseHandler";
import HeroProfileEventResponseHandler from "../handler/HeroProfileEventResponseHandler";
import MahjongGameEndEventResponseHandler from "./handler/MahjongGameEndEventResponseHandler";
import MahjongPrepareGameSceneResponseHandler from "./handler/MahjongPrepareGameSceneResponseHandler";
import MahjongEndEventResponseHandler from "./handler/MahjongEndEventResponseHandler";
import DismissVoteEventResponseHandler from "../handler/DismissVoteEventResponseHandler";
import AbstractRoomConfig from "../AbstractRoomConfig";

export default class MahjongRoomConfig extends AbstractRoomConfig {

    /**
     * 初始化
     * @param host
     * @param port
     */
    constructor(host: string, port: number) {
        super(host, port);
        this._config.addRouter(0, 0, new RoomCommonResponseHandler());
        this._config.addRouter(1, 1, new RoomLoginResponseHandler());
        this._config.addRouter(1, 2, new LoginNotifyResponseHandler());
        this._config.addRouter(2, 1, new CreateTableEventResponseHandler());
        this._config.addRouter(2, 2, new JoinTableEventResponseHandler());
        this._config.addRouter(2, 3, new HeroEnterEventResponseHandler());
        this._config.addRouter(2, 4, new HeroLeaveEventResponseHandler());
        this._config.addRouter(2, 5, new HeroOnlineEventResponseHandler());
        this._config.addRouter(2, 6, new HeroOfflineEventResponseHandler());
        this._config.addRouter(2, 7, new HeroSitDownEventResponseHandler());
        this._config.addRouter(2, 8, new HeroStandUpEventResponseHandler());
        this._config.addRouter(2, 9, new HeroSceneResponseHandler());
        this._config.addRouter(2, 10, new ChatEventResponseHandler());
        this._config.addRouter(2, 11, new HeroProfileEventResponseHandler());
        this._config.addRouter(2, 12, new DismissVoteEventResponseHandler());
        this._config.addRouter(8, -1, new MahjongErrorEventResponseHandler());
        this._config.addRouter(8, 0, new MahjongGameStartResponseHandler());
        this._config.addRouter(8, 1, new MahjongDispathCardResponseHandler());
        this._config.addRouter(8, 2, new MahjongOutCardResponseHandler());
        this._config.addRouter(8, 3, new MahjongOperateNotifyEventResponseHandler());
        this._config.addRouter(8, 4, new MahjongOperateResultEventResponseHandler());
        this._config.addRouter(8, 5, new MahjongGameStatusResponseHandler());
        this._config.addRouter(8, 6, new MahjongPlayingGameSceneResponseHandler());
        this._config.addRouter(8, 7, new MahjongPrepareGameSceneResponseHandler());
        this._config.addRouter(8, 8, new MahjongGameEndEventResponseHandler());
        this._config.addRouter(8, 9, new MahjongEndEventResponseHandler());
        this._config.setWsEventListener(new RoomWsListener());
    }

    /**
     * 创建
     */
    onCreate(): void {
        FireKit.use(AppConfig.GAME_FIRE).onGroup("open", MahjongRoomConfig.onOpen, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("create_table_success", MahjongRoomConfig.onCreateTableSuccess, this);
        FireKit.use(AppConfig.GAME_FIRE).onGroup("join_table_success", MahjongRoomConfig.onJoinTableSuccess, this);
    }

    /**
     * 摧毁
     */
    onDestroy(): void {
        FireKit.use(AppConfig.GAME_FIRE).offGroup(this);
    }

    /**
     * 创建连接成功
     */
    static onOpen() {
        let user = JSON.parse(cc.sys.localStorage.getItem("user"));
        AiJKit.use(AppConfig.GAME_WS_NAME).send(new RoomMobileLoginEvent(user.username, user.password)); //发送登录请求
    };

    /**
     * 创建房间成功
     * @param resp
     */
    static onCreateTableSuccess(resp: CreateTableEventResponse) {
        AiJKit.use(AppConfig.GAME_WS_NAME).send(new JoinTableEvent(resp.tableNo)); //发送加入房间请求
    };

    /**
     * 加入房间成功
     * @param resp
     */
    static onJoinTableSuccess(resp: JoinTableEventResponse) {
        UIManger.getInst().switchLayer(MahjongGameLayer, resp);
    };

}
