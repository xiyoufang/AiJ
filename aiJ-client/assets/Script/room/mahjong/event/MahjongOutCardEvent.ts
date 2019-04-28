import {AiJ} from "../../../ws/AiJ";


export default class MahjongOutCardEvent extends AiJ.AiJEvent {

    /**
     * 牌
     */
    card: number;

    constructor(card: number) {
        super();
        this.mainType = 8;
        this.subType = 0;
        this.card = card;
    }
}
