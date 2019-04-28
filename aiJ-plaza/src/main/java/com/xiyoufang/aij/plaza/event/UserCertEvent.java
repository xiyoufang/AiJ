package com.xiyoufang.aij.plaza.event;

import com.xiyoufang.aij.event.Event;

/**
 * Created by 席有芳 on 2019-03-03.
 * 用户实名
 *
 * @author 席有芳
 */
public class UserCertEvent extends Event {
    /**
     * 真实姓名
     */
    private String certName;
    /**
     * 真实证件号
     */
    private String certCard;
    /**
     * 真实手机
     */
    private String certMobile;
    /**
     * 实名制类型
     */
    private String certType;

    public String getCertName() {
        return certName;
    }

    public void setCertName(String certName) {
        this.certName = certName;
    }

    public String getCertCard() {
        return certCard;
    }

    public void setCertCard(String certCard) {
        this.certCard = certCard;
    }

    public String getCertMobile() {
        return certMobile;
    }

    public void setCertMobile(String certMobile) {
        this.certMobile = certMobile;
    }

    public String getCertType() {
        return certType;
    }

    public void setCertType(String certType) {
        this.certType = certType;
    }
}
