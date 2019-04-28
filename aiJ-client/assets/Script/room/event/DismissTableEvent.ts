import {AiJ} from "../../ws/AiJ";

/**
 * 解散桌子
 */
export default class DismissTableEvent extends AiJ.AiJEvent {

    constructor() {
        super();
        this.mainType = 2;
        this.subType = 3;
    }
}
