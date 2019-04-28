import {AiJ} from "../../ws/AiJ";

/**
 * 创建桌子事件
 */
export default class CreateTableEvent extends AiJ.AiJEvent {

    ruleText: string = "{}";

    constructor() {
        super();
        this.mainType = 2;
        this.subType = 1;
    }

}
