import * as _ from "lodash";

export default class GameServiceManager {

    private static inst: GameServiceManager;
    /**
     * 服务器列表
     */
    private serviceItems: Array<GameService>;

    /**
     * 获取游戏服务管理的单例
     */
    public static getInst(): GameServiceManager {
        if (GameServiceManager.inst == null) {
            GameServiceManager.inst = new GameServiceManager();
        }
        return GameServiceManager.inst;
    }

    /**
     * 初始化服务器列表
     * @param serviceItems
     */
    public initGameService(serviceItems: Array<GameService>): void {
        this.serviceItems = serviceItems;
    }

    /**
     * 通过服务名称获取服务列表
     * @param name
     */
    public getGameService(name: string): Array<GameService> {
        return _.filter(this.serviceItems, {name: name});
    }


    /**
     * 通过服务Id获取服务列表
     * @param serviceId 服务ID
     */
    public getGameServiceByServiceId(serviceId: number): GameService {
        return _.find(this.serviceItems, {serviceId: serviceId});
    }

    /**
     * 随机获取一台服务器
     * @param name
     */
    public randomGameService(name: string): GameService {
        let serviceItems = _.filter(this.serviceItems, {name: name});
        return serviceItems.length == 0 ? null : _.shuffle(serviceItems)[0];
    }

}

class GameService {
    /**
     * 服务ID
     */
    serviceId: number;
    /**
     * 服务地址
     */
    address: string;
    /**
     * 端口
     */
    port: number;
    /**
     * 服务名称
     */
    name: string;
    /**
     * 启用状态
     */
    enable: boolean;

}


