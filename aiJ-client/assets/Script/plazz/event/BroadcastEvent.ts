import {AiJ} from "../../ws/AiJ";

/**
 * 大厅广播
 */
export default class BroadcastEvent extends AiJ.AiJEvent {

    constructor() {
        super();
        this.mainType = 2;
        this.subType = 2;
    }
}
