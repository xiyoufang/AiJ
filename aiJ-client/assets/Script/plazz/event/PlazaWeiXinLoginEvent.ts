import {AiJ} from "../../ws/AiJ";


export default class PlazaWeiXinLoginEvent extends AiJ.AiJEvent {

    /**
     * 电话号码
     */
    code: string;


    constructor(code: string) {
        super();
        this.code = code;
        this.mainType = 1;
        this.subType = 3;
    }
}
