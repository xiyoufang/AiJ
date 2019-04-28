import {AiJ} from "../../../ws/AiJ";

export default class MahjongOutCardEventResponse extends AiJ.Response {
    /**
     * 牌
     */
    card: number;
    /**
     * 方位
     */
    chair: number;

}
