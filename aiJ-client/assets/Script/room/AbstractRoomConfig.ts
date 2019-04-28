import {AiJ} from "../ws/AiJ";
import AiJKit from "../ws/AiJKit";
import AppConfig from "../AppConfig";
import FireKit from "../fire/FireKit";

export default abstract class AbstractRoomConfig {

    /**
     * IP
     */
    protected host: string;
    /**
     * 端口
     */
    protected port: number;
    /**
     * URL
     */
    protected url: string;
    /**
     * Ws配置
     */
    protected _config: AiJ.Config;

    /**
     * RoomConfig单例
     */
    static _inst: AbstractRoomConfig;

    /**
     * 获取实例
     */
    public static getInst(): AbstractRoomConfig {
        return AbstractRoomConfig._inst;
    }

    /**
     * 摧毁实例
     */
    public static destroyInst(): void {
        if (AbstractRoomConfig._inst != null) {
            AbstractRoomConfig._inst.destroy();
            AbstractRoomConfig._inst = null;
        }
    }

    /**
     *创建实例
     * @param inst
     */
    private static createInst(inst: AbstractRoomConfig): void {
        AbstractRoomConfig._inst = inst;
        AbstractRoomConfig._inst.create();
    }

    /**
     * 构造
     * @param host
     * @param port
     */
    protected constructor(host: string, port: number) {
        this.host = host;
        this.port = port;
        this.url = "ws://" + host + ":" + port;
        this._config = new AiJ.Config(this.url, new AiJ.Options());
        AbstractRoomConfig.destroyInst();
        AbstractRoomConfig.createInst(this);
    }

    /**
     * 初始化
     */
    public create(): void {
        this.onCreate();
        AiJKit.init(AppConfig.GAME_WS_NAME, this._config);
    }

    /**
     * 摧毁
     */
    public destroy(): void {
        AiJKit.close(AppConfig.GAME_WS_NAME);
        this.onDestroy();
    }

    /**
     * 创建事件
     */
    protected abstract onCreate(): void;

    /**
     * 摧毁事件
     */
    protected abstract onDestroy(): void;


}
