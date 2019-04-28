import {AiJ} from "../../../ws/AiJ";

export default class MahjongDispatchCardEventResponse extends AiJ.Response {
    /**
     * 椅子
     */
    chair: number;
    /**
     * 牌
     */
    card: number;
    /**
     * 末尾
     */
    tail: boolean;
}
