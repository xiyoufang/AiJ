export default class AppConfig {

    /**
     * 大厅URL
     */
    static readonly PLAZA_WS_HOST: string = "localhost";
    /**
     * 大厅端口
     */
    static readonly PLAZA_WS_PORT: number = 8082;
    /**
     *
     */
    static readonly PLATFORM_URL: string = "http://localhost:8090/";
    /**
     * WS名称
     */
    static readonly PLAZA_WS_NAME: string = "PLAZA_WS";
    /**
     * 本地事件发布与订阅
     */
    static readonly LOCAL_FIRE: string = "LOCAL_FIRE";
    /**
     * 大厅事件发布与订阅名称
     */
    static readonly PLAZA_FIRE: string = "PLAZA_FIRE";
    /**
     * 游戏事件订阅
     */
    static readonly GAME_FIRE: string = "GAME_FIRE";
    /**
     * 游戏
     */
    static readonly GAME_WS_NAME: string = "GAME_WS_NAME";

}
