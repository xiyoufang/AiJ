import {AiJ} from "../../ws/AiJ";

/**
 * 交易记录
 */
export default class RechargeRecordEvent extends AiJ.AiJEvent {

    /**
     * 页码
     */
    page: number;
    /**
     * 每页显示条数
     */
    pageSize: number;
    /**
     * 类型
     */
    assetCode: string;

    constructor(page: number, pageSize: number, assetCode: string) {
        super();
        this.mainType = 4;
        this.subType = 3;
        this.page = page;
        this.pageSize = pageSize;
        this.assetCode = assetCode;
    }
}
