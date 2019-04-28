package com.xiyoufang.aij.plaza.response;

import com.xiyoufang.aij.response.CommonResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2019-03-01.
 *
 * @author 席有芳
 */
public class RechargeRecordEventResponse extends CommonResponse {
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
    private List<RechargeRecord> rechargeRecords = new ArrayList<>();

    /**
     * 房间记录
     */
    public static class RechargeRecord {
        /**
         * 卖家ID
         */
        private String sellerId;
        /**
         * 卖家名称
         */
        private String sellerName;
        /**
         * 卖家ID
         */
        private String buyerId;
        /**
         * 卖家名称
         */
        private String buyerName;
        /**
         * 数量
         */
        private int quantity;
        /**
         * 资产类型
         */
        private String assetCode;
        /**
         *
         */
        private String createdTime;

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public String getSellerId() {
            return sellerId;
        }

        public void setSellerId(String sellerId) {
            this.sellerId = sellerId;
        }

        public String getSellerName() {
            return sellerName;
        }

        public void setSellerName(String sellerName) {
            this.sellerName = sellerName;
        }

        public String getBuyerId() {
            return buyerId;
        }

        public void setBuyerId(String buyerId) {
            this.buyerId = buyerId;
        }

        public String getBuyerName() {
            return buyerName;
        }

        public void setBuyerName(String buyerName) {
            this.buyerName = buyerName;
        }

        public String getAssetCode() {
            return assetCode;
        }

        public void setAssetCode(String assetCode) {
            this.assetCode = assetCode;
        }

        public String getCreatedTime() {
            return createdTime;
        }

        public void setCreatedTime(String createdTime) {
            this.createdTime = createdTime;
        }
    }

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

    public List<RechargeRecord> getRechargeRecords() {
        return rechargeRecords;
    }

    public void setRechargeRecords(List<RechargeRecord> rechargeRecords) {
        this.rechargeRecords = rechargeRecords;
    }
}
