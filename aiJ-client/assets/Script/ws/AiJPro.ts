import {AiJ} from "./AiJ";
import Config = AiJ.Config;
import AiJEvent = AiJ.AiJEvent;

export default class AiJPro {

    private aij: AiJ;

    constructor(config: Config) {
        this.aij = new AiJ(config);
    }

    /**
     * 是否连接
     */
    public isOpen(): boolean {
        return this.aij.aiJWs.readyState == this.aij.aiJWs.ws.OPEN;
    }

    /**
     * 发送请求
     * @param event
     */
    public send(event: AiJEvent): void {
        this.aij.send(event);
    }

    /**
     * 链接
     */
    public connect(): void {
        this.aij.aiJWs.connect(false);
    }

    /**
     * 断开链接
     */
    close(): void {
        this.aij.aiJWs.close();
    }

}
