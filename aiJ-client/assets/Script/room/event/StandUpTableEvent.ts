import {AiJ} from "../../ws/AiJ";

/**
 * 起立
 */
export default class StandUpTableEvent extends AiJ.AiJEvent {

    constructor() {
        super();
        this.mainType = 2;
        this.subType = 8;
    }
}
