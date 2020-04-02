import {AiJ} from "../../ws/AiJ";

export default class JoinTableEventResponse extends AiJ.Response {
    /**
     * 显示ID
     */
    showId: string;
    /**
     * 自己的ID
     */
    userId: string;
    /**
     * 桌子编号
     */
    tableNo: number;
    /**
     * 椅子编号
     */
    chair: number;
    /**
     * 规则
     */
    ruleText: string;
    /**
     * 房主ID
     */
    ownerId: string;

}
