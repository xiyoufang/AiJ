import {AiJ} from "../../ws/AiJ";

/**
 * 离开
 */
export default class LeaveTableEvent extends AiJ.AiJEvent {

    constructor() {
        super();
        this.mainType = 2;
        this.subType = 4;
    }
}
