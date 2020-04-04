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
     * 图标
     */
    private String serviceIcon;
    /**
     * 部署地址
     */
    private String serviceDeployment;
    /**
     * 排序
     */
    private int serviceSort;
    /**
     * 服务Code
     */
    private int serviceCode;
    /**
     * 服务名称
     */
    private String serviceName;
    /**
     * 服务描述
     */
    private String serviceDescription;
    /**
     * 服务地址
     */
    private String address;
    /**
     * 端口
     */
    private int port;
    /**
     * 节点名称
     */
    private String nodeName;
    /**
     * 节点描述
     */
    private String nodeDescription;
    /**
     * 节点Token，用于与其它服务器鉴权
     */
    private String nodeToken;
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

    public String getServiceIcon() {
        return serviceIcon;
    }

    public void setServiceIcon(String serviceIcon) {
        this.serviceIcon = serviceIcon;
    }

    public String getServiceDeployment() {
        return serviceDeployment;
    }

    public void setServiceDeployment(String serviceDeployment) {
        this.serviceDeployment = serviceDeployment;
    }

    public int getServiceSort() {
        return serviceSort;
    }

    public void setServiceSort(int serviceSort) {
        this.serviceSort = serviceSort;
    }

    public int getServiceCode() {
        return serviceCode;
    }

    public void setServiceCode(int serviceCode) {
        this.serviceCode = serviceCode;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceDescription() {
        return serviceDescription;
    }

    public void setServiceDescription(String serviceDescription) {
        this.serviceDescription = serviceDescription;
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

    public String getNodeName() {
        return nodeName;
    }

    public void setNodeName(String nodeName) {
        this.nodeName = nodeName;
    }

    public String getNodeDescription() {
        return nodeDescription;
    }

    public void setNodeDescription(String nodeDescription) {
        this.nodeDescription = nodeDescription;
    }

    public String getNodeToken() {
        return nodeToken;
    }

    public void setNodeToken(String nodeToken) {
        this.nodeToken = nodeToken;
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
