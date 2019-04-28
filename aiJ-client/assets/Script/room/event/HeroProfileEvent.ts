import {AiJ} from "../../ws/AiJ";

export default class HeroProfileEvent extends AiJ.AiJEvent {
    /**
     * 用户ID
     */
    userId: string;

    constructor(userId: string) {
        super();
        this.mainType = 2;
        this.subType = 6;
        this.userId = userId;
    }

}
