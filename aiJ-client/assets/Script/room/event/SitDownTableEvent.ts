import {AiJ} from "../../ws/AiJ";

/**
 * 坐下
 */
export default class SitDownTableEvent extends AiJ.AiJEvent {

    constructor() {
        super();
        this.mainType = 2;
        this.subType = 7;
    }
}
