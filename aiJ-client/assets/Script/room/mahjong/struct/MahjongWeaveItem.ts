import {MahjongWeaveType} from "./MahjongWeaveType";

export default class MahjongWeaveItem {
    /**
     * 组合类型
     */
    weaveType: MahjongWeaveType;
    /**
     * 中间的牌
     */
    centerCard: number;
    /**
     * 是否公开
     */
    open: boolean;
    /**
     * 供应者
     */
    provider: number;

    constructor(weaveType: MahjongWeaveType, centerCard: number, open: boolean, provider: number) {
        this.weaveType = weaveType;
        this.centerCard = centerCard;
        this.open = open;
        this.provider = provider;
    }
}
