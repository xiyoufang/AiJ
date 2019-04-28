import {AiJ} from "../../ws/AiJ";

/**
 * 投票
 */
export default class DismissVoteTableEvent extends AiJ.AiJEvent {

    /**
     * 同意
     */
    agree: boolean;

    constructor(agree: boolean) {
        super();
        this.mainType = 2;
        this.subType = 9;
        this.agree = agree;
    }
}
