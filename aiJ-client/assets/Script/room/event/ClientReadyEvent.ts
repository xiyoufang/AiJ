import {AiJ} from "../../ws/AiJ";

export default class ClientReadyEvent extends AiJ.AiJEvent {

    constructor() {
        super();
        this.mainType = 2;
        this.subType = 5;
    }
}
