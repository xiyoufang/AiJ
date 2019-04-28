package com.xiyoufang.aij.plaza.response;

import com.xiyoufang.aij.response.CommonResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-27.
 * 房间服务响应
 *
 * @author 席有芳
 */
public class RoomServiceEventResponse extends CommonResponse {

    public static class RoomItem {
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
    }

    /**
     * 房间列表
     */
    private List<RoomItem> roomItems = new ArrayList<>();

    public List<RoomItem> getRoomItems() {
        return roomItems;
    }

    public void setRoomItems(List<RoomItem> roomItems) {
        this.roomItems = roomItems;
    }
}
