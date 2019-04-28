package com.xiyoufang.aij.core;

import java.util.Date;

/**
 * Created by 席有芳 on 2018-12-27.
 *
 * @author 席有芳
 */
public class ServiceDetail {
    /**
     * 服务类型
     */
    private ServiceType serviceType;
    /**
     * 服务ID
     */
    private int serviceId;
    /**
     * 服务Code
     */
    private int serviceCode;
    /**
     * 服务地址
     */
    private String address;
    /**
     * 端口
     */
    private int port;
    /**
     * 服务名称
     */
    private String name;
    /**
     * 启用状态
     */
    private boolean enable;
    /**
     * 注册时间
     */
    private Date registered;

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public int getServiceId() {
        return serviceId;
    }

    public void setServiceId(int serviceId) {
        this.serviceId = serviceId;
    }

    public int getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(int serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isEnable() {
        return enable;
    }

    public void setEnable(boolean enable) {
        this.enable = enable;
    }

    public Date getRegistered() {
        return registered;
    }

    public void setRegistered(Date registered) {
        this.registered = registered;
    }
}
