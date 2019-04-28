import {AiJ} from "../../ws/AiJ";

export default class RechargeRecordEventResponse extends AiJ.Response {

    /**
     * 总行
     */
    totalRow: number;
    /**
     * 总页
     */
    totalPage: number;
    /**
     * 记录明细
     */
    rechargeRecords: Array<RechargeRecord>;
}

class RechargeRecord {
    /**
     * 卖家ID
     */
    sellerId: string;
    /**
     * 卖家名称
     */
    sellerName: string;
    /**
     * 卖家ID
     */
    buyerId: string;
    /**
     * 卖家名称
     */
    buyerName: string;
    /**
     * 数量
     */
    quantity: number;
    /**
     * 资产类型
     */
    assetCode: string;
    /**
     *
     */
    createdTime: string;
}
