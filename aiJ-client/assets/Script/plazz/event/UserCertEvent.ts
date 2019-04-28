import {AiJ} from "../../ws/AiJ";

export default class UserCertEvent extends AiJ.AiJEvent {


    certName: string;
    /**
     * 真实证件号
     */
    certCard: string;
    /**
     * 真实手机
     */
    certMobile: string;
    /**
     * 实名制类型
     */
    certType: string;

    constructor(certName: string, certCard: string, certMobile: string, certType: string) {
        super();
        this.mainType = 4;
        this.subType = 4;
        this.certName = certName;
        this.certCard = certCard;
        this.certMobile = certMobile;
        this.certType = certType;
    }
}
