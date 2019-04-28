import {AiJ} from "../../ws/AiJ";

/**
 * 资产查询结果响应
 */
export default class UserAssetEventResponse extends AiJ.Response {

    assetsQuantity: { [assetCode: string]: number } = {};

}
