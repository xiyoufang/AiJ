import {AiJ} from "../../ws/AiJ";

export default class RoomServiceEventResponse extends AiJ.Response {
    roomItems: Array<RoomItem>;

}

export class RoomItem {
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
