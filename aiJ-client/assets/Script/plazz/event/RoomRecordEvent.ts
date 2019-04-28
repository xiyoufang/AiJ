import {AiJ} from "../../ws/AiJ";

/**
 * 房间游戏记录
 */
export default class RoomRecordEvent extends AiJ.AiJEvent {
    /**
     * 页
     */
    page: number;
    /**
     * 页大小
     */
    pageSize: number;

    constructor(page: number, pageSize: number) {
        super();
        this.page = page;
        this.pageSize = pageSize;
        this.mainType = 3;
        this.subType = 2;
    }
}
