import {AiJ} from "../ws/AiJ";
import AppConfig from "../AppConfig";
import PlazaCommonResponseHandler from "./handler/PlazaCommonResponseHandler";
import PlazaLoginHandler from "./handler/PlazaLoginHandler";
import RoomEventResponseHandler from "./handler/RoomEventResponseHandler";
import PlazaWsListener from "./PlazaWsListener";
import AiJKit from "../ws/AiJKit";
import PlazaMobileLoginEvent from "./event/PlazaMobileLoginEvent";
import FireKit from "../fire/FireKit";
import AiJPro from "../ws/AiJPro";
import RoomRecordEventResponseHandler from "./handler/RoomRecordEventResponseHandler";
import BroadcastEventResponseHandler from "./handler/BroadcastEventResponseHandler";
import UserAssetEventResponseHandler from "./handler/UserAssetEventResponseHandler";
import UserAssetTransEventResponseHandler from "./handler/UserAssetTransEventResponseHandler";
import RechargeRecordEventResponseHandler from "./handler/RechargeRecordEventResponseHandler";
import UserCertEventResponseHandler from "./handler/UserCertEventResponseHandler";

export default class PlazaConfig {

    /**
     * Ws配置
     */
    _config: AiJ.Config;
    /**
     * URL
     */
    url: string;
    /**
     * AiJPro
     */
    _aiJPro: AiJPro;

    private static inst: PlazaConfig;

    /**
     * 初始化
     * @param host
     * @param port
     */
    public static init(host: string, port: number): void {
        if (PlazaConfig.inst != null) {
            PlazaConfig.inst.close();
        }
        PlazaConfig.inst = new PlazaConfig(host, port);
    }

    /**
     * 获取实例
     */
    public static getInst(): PlazaConfig {
        return PlazaConfig.inst;
    }

    private constructor(host: string, port: number) {
        this.url = "ws://" + host + ":" + port;
        this._config = new AiJ.Config(this.url, new AiJ.Options());
        this._config.addRouter(0, 0, new PlazaCommonResponseHandler());
        this._config.addRouter(1, 1, new PlazaLoginHandler());
        this._config.addRouter(2, 2, new BroadcastEventResponseHandler());
        this._config.addRouter(3, 1, new RoomEventResponseHandler());
        this._config.addRouter(3, 2, new RoomRecordEventResponseHandler());
        this._config.addRouter(4, 1, new UserAssetEventResponseHandler());
        this._config.addRouter(4, 2, new UserAssetTransEventResponseHandler());
        this._config.addRouter(4, 3, new RechargeRecordEventResponseHandler());
        this._config.addRouter(4, 4, new UserCertEventResponseHandler());
        this._config.setWsEventListener(new PlazaWsListener());
        FireKit.use(AppConfig.LOCAL_FIRE).on("login", this.login);  //绑定登录事件
        AiJKit.init(AppConfig.PLAZA_WS_NAME, this._config);
        this._aiJPro = AiJKit.use(AppConfig.PLAZA_WS_NAME);
    }

    /**
     * 关闭
     */
    private close(): void {
        AiJKit.close(AppConfig.PLAZA_WS_NAME);
        FireKit.use(AppConfig.LOCAL_FIRE).off("login", this.login);
    }

    login = function () {
        let userText = cc.sys.localStorage.getItem("user");
        if (userText != null && userText.length > 0) {
            let user = JSON.parse(userText);
            AiJKit.use(AppConfig.PLAZA_WS_NAME).send(new PlazaMobileLoginEvent(user.username, user.password));
        }
    }

}
