package com.xiyoufang.aij.plaza.handler;

import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.plaza.config.AiJPlazaDb;
import com.xiyoufang.aij.plaza.event.RechargeRecordEvent;
import com.xiyoufang.aij.plaza.response.RechargeRecordEventResponse;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

import java.util.ArrayList;

/**
 * Created by 席有芳 on 2019-03-01.
 *
 * @author 席有芳
 */
public class RechargeRecordEventHandler extends AuthorizedEventHandler<RechargeRecordEvent> {

    public RechargeRecordEventHandler() {
        super(RechargeRecordEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(RechargeRecordEvent event, String userId, ChannelContext channelContext) {
        SqlPara sqlPara = AiJPlazaDb.uc().getSqlPara("plaza.get_user_asset_trans_pages", userId, event.getAssetCode());
        Page<Record> recordPage = AiJPlazaDb.uc().paginate(event.getPage(), 20, sqlPara);
        RechargeRecordEventResponse response = ResponseFactory.success(RechargeRecordEventResponse.class, "交易记录");
        response.setTotalPage(recordPage.getTotalPage());
        response.setTotalRow(recordPage.getTotalRow());
        ArrayList<RechargeRecordEventResponse.RechargeRecord> rechargeRecords = new ArrayList<>();
        response.setRechargeRecords(rechargeRecords);
        for (Record record : recordPage.getList()) {
            RechargeRecordEventResponse.RechargeRecord rechargeRecord = new RechargeRecordEventResponse.RechargeRecord();
            rechargeRecord.setSellerId(record.getStr("seller_id"));
            rechargeRecord.setSellerName(record.getStr("seller_name"));
            rechargeRecord.setBuyerId(record.getStr("buyer_id"));
            rechargeRecord.setBuyerName(record.getStr("buyer_name"));
            rechargeRecord.setAssetCode(record.getStr("asset_code"));
            rechargeRecord.setQuantity(record.getInt("quantity"));
            rechargeRecord.setCreatedTime(record.getStr("created_time"));
            rechargeRecords.add(rechargeRecord);
        }
        Tio.send(channelContext, WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
    }
}