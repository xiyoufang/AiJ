import {AiJ} from "../../ws/AiJ";

/**
 * 读用户资产数据
 */
export default class UserAssetEvent extends AiJ.AiJEvent {

    assetCodes: Array<string>;

    constructor(assetCodes: Array<string>) {
        super();
        this.assetCodes = assetCodes;
        this.mainType = 4;
        this.subType = 1;
    }
}
