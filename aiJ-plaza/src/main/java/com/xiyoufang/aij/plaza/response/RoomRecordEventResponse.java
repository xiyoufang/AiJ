package com.xiyoufang.aij.plaza.response;

import com.xiyoufang.aij.response.CommonResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2019-01-30.
 *
 * @author 席有芳
 */
public class RoomRecordEventResponse extends CommonResponse {
    /**
     * 总行数
     */
    private int totalRow;
    /**
     * 总页码
     */
    private int totalPage;
    /**
     * 记录
     */
    private List<RoomRecord> roomRecords = new ArrayList<>();

    public int getTotalRow() {
        return totalRow;
    }

    public void setTotalRow(int totalRow) {
        this.totalRow = totalRow;
    }

    public int getTotalPage() {
        return totalPage;
    }

    public void setTotalPage(int totalPage) {
        this.totalPage = totalPage;
    }

    public List<RoomRecord> getRoomRecords() {
        return roomRecords;
    }

    public void setRoomRecords(List<RoomRecord> roomRecords) {
        this.roomRecords = roomRecords;
    }

    /**
     * 房间记录
     */
    public static class RoomRecord {
        /**
         * 记录ID
         */
        private long id;
        /**
         * 桌号
         */
        private int tableNo;
        /**
         * 创建人
         */
        private String ownerId;
        /**
         * 用户ID
         */
        private String userId;
        /**
         * 昵称
         */
        private String nickName;
        /**
         * 分数
         */
        private int score;
        /**
         * 摘要
         */
        private String summary;
        /**
         * 记录详情
         */
        private String detail;
        /**
         * 规则
         */
        private String rule;
        /**
         * 开始时间
         */
        private String startedTime;
        /**
         * 截止时间
         */
        private String endedTime;
        /**
         * 服务ID
         */
        private int serviceId;
        /**
         * 服务名称
         */
        private String serviceName;
        /**
         * 椅子编号
         */
        private int chair;

        public long getId() {
            return id;
        }

        public void setId(long id) {
            this.id = id;
        }

        public int getTableNo() {
            return tableNo;
        }

        public void setTableNo(int tableNo) {
            this.tableNo = tableNo;
        }

        public String getNickName() {
            return nickName;
        }

        public void setNickName(String nickName) {
            this.nickName = nickName;
        }

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }

        public String getDetail() {
            return detail;
        }

        public void setDetail(String detail) {
            this.detail = detail;
        }

        public String getRule() {
            return rule;
        }

        public void setRule(String rule) {
            this.rule = rule;
        }

        public String getStartedTime() {
            return startedTime;
        }

        public void setStartedTime(String startedTime) {
            this.startedTime = startedTime;
        }

        public String getEndedTime() {
            return endedTime;
        }

        public void setEndedTime(String endedTime) {
            this.endedTime = endedTime;
        }

        public void setServiceId(int serviceId) {
            this.serviceId = serviceId;
        }

        public int getServiceId() {
            return serviceId;
        }

        public void setServiceName(String serviceName) {
            this.serviceName = serviceName;
        }

        public String getServiceName() {
            return serviceName;
        }

        public String getOwnerId() {
            return ownerId;
        }

        public void setOwnerId(String ownerId) {
            this.ownerId = ownerId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUserId() {
            return userId;
        }

        public void setChair(int chair) {
            this.chair = chair;
        }

        public int getChair() {
            return chair;
        }

        public String getSummary() {
            return summary;
        }

        public void setSummary(String summary) {
            this.summary = summary;
        }
    }


}
