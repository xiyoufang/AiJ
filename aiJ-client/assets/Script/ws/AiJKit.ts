import AiJPro from "./AiJPro";
import {AiJ} from "./AiJ";
import Config = AiJ.Config;

export default class AiJKit {

    static aiJProDict: { [key: string]: AiJPro; } = {};

    /**
     * 初始化 AiJPro
     * @param name
     * @param config
     */
    static init(name: string, config: Config): void {
        if (!AiJKit.exist(name)) {
            AiJKit.aiJProDict[name] = new AiJPro(config);
        } else {
            throw Error(`Websocket ${name} 已经存在`);
        }
    }

    /**
     * 是否存在
     * @param name
     */
    static exist(name: string): boolean {
        return this.aiJProDict[name] != null;
    }

    /**
     * 获取 AiJPro
     * @param name
     */
    static use(name: string): AiJPro {
        return AiJKit.aiJProDict[name];
    }

    /**
     * 强制关闭
     * @param name
     */
    static close(name: string) {
        AiJKit.aiJProDict[name].close();
        delete AiJKit.aiJProDict[name];
    }

}
