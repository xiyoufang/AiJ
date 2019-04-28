import {AiJ} from "../../ws/AiJ";

export default class RoomEvent extends AiJ.AiJEvent {

    constructor() {
        super();
        this.mainType = 3;
        this.subType = 1;
    }
}
