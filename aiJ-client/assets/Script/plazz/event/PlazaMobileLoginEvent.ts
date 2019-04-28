import {AiJ} from "../../ws/AiJ";


export default class PlazaMobileLoginEvent extends AiJ.AiJEvent {

    /**
     * 电话号码
     */
    mobile: string;
    /**
     * 密码
     */
    password: string;

    constructor(mobile: string, password: string) {
        super();
        this.mobile = mobile;
        this.password = password;
        this.mainType = 1;
        this.subType = 1;
    }
}
