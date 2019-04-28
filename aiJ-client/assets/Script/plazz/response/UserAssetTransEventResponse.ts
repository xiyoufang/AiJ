import {AiJ} from "../../ws/AiJ";

export default class UserAssetTransEventResponse extends AiJ.Response {

    /**
     * 是否成功
     */
    success: boolean;
    /**
     * 剩余数量
     */
    quantity: number;
    /**
     * 提示信息
     */
    tips: string;
    /**
     * 资产Code
     */
    assetCode: string;
}
