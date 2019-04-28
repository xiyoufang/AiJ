import {AiJ} from "../../ws/AiJ";

/**
 * 加入房间事件
 */
export default class JoinTableEvent extends AiJ.AiJEvent {

    tableNo: number;

    constructor(tableNo: number) {
        super();
        this.mainType = 2;
        this.subType = 2;
        this.tableNo = tableNo;
    }

}
