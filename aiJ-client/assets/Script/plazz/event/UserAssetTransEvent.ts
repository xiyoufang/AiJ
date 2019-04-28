import {AiJ} from "../../ws/AiJ";

export default class UserAssetTransEvent extends AiJ.AiJEvent {

    /**
     * 资产Code
     */
    assetCode: string;
    /**
     * 买方用户ID
     */
    buyerId: string;
    /**
     * 数量
     */
    quantity: number;


    constructor(assetCode: string, buyerId: string, quantity: number) {
        super();
        this.mainType = 4;
        this.subType = 2;
        this.assetCode = assetCode;
        this.buyerId = buyerId;
        this.quantity = quantity;
    }
}
