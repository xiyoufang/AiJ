import {AiJ} from "../../ws/AiJ";

export default class RoomRecordEventResponse extends AiJ.Response {

    /**
     * 总行数
     */
    totalRow: number;
    /**
     * 总页码
     */
    totalPage: number;
    /**
     * 记录
     */
    roomRecords: Array<RoomRecord>;

}

export class RoomRecord {
    /**
     * 记录ID
     */
    id: number;
    /**
     * 桌号
     */
    tableNo: number;
    /**
     * 创建人
     */
    ownerId: string;
    /**
     * 用户ID
     */
    userId: string;
    /**
     * 昵称
     */
    nickName: string;
    /**
     * 分数
     */
    score: number;
    /**
     * 记录详情
     */
    detail: string;
    /**
     * 用户详情
     */
    summary: string;
    /**
     * 规则
     */
    rule: string;
    /**
     * 开始时间
     */
    startedTime: string;
    /**
     * 截止时间
     */
    endedTime: string;
    /**
     * 服务ID
     */
    serviceId: number;
    /**
     * 服务名称
     */
    serviceName: string;
    /**
     * 椅子编号
     */
    chair: number;
}


export class RoomRecordSummary {
    /**
     * 用户ID
     */
    userId: string;
    /**
     * 用户昵称
     */
    nickName: string;
    /**
     * 分数
     */
    score: number;
}
