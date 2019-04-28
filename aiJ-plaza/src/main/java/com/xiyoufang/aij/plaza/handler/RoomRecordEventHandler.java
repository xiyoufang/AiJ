package com.xiyoufang.aij.plaza.handler;

import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.plaza.config.AiJPlazaDb;
import com.xiyoufang.aij.plaza.event.RoomRecordEvent;
import com.xiyoufang.aij.plaza.response.RoomRecordEventResponse;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

import java.util.ArrayList;

/**
 * Created by 席有芳 on 2019-01-30.
 *
 * @author 席有芳
 */
public class RoomRecordEventHandler extends AuthorizedEventHandler<RoomRecordEvent> {

    public RoomRecordEventHandler() {
        super(RoomRecordEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(RoomRecordEvent event, String userId, ChannelContext channelContext) {
        SqlPara sqlPara = AiJPlazaDb.room().getSqlPara("plaza.get_room_record_pages", userId);
        Page<Record> recordPage = AiJPlazaDb.room().paginate(event.getPage(), 20, sqlPara);
        RoomRecordEventResponse roomRecordEventResponse = ResponseFactory.success(RoomRecordEventResponse.class, "游戏记录");
        roomRecordEventResponse.setTotalPage(recordPage.getTotalPage());
        roomRecordEventResponse.setTotalRow(recordPage.getTotalRow());
        ArrayList<RoomRecordEventResponse.RoomRecord> roomRecords = new ArrayList<>();
        roomRecordEventResponse.setRoomRecords(roomRecords);
        for (Record record : recordPage.getList()) { //房间游戏记录
            RoomRecordEventResponse.RoomRecord roomRecord = new RoomRecordEventResponse.RoomRecord();
            roomRecord.setDetail(record.getStr("detail"));
            roomRecord.setSummary(record.getStr("summary"));
            roomRecord.setStartedTime(record.getStr("started_time"));
            roomRecord.setEndedTime(record.getStr("ended_time"));
            roomRecord.setId(record.getLong("id"));
            roomRecord.setUserId(record.getStr("user_id"));
            roomRecord.setNickName(record.getStr("nick_name"));
            roomRecord.setRule(record.getStr("rule"));
            roomRecord.setScore(record.getInt("score"));
            roomRecord.setServiceId(record.getInt("service_id"));
            roomRecord.setServiceName(record.getStr("service_name"));
            roomRecord.setOwnerId(record.getStr("owner_id"));
            roomRecord.setTableNo(record.getInt("table_no"));
            roomRecord.setChair(record.getInt("chair"));
            roomRecords.add(roomRecord);
        }
        Tio.send(channelContext, WsResponse.fromText(roomRecordEventResponse.toJson(), AppConfig.use().getCharset()));
    }

}
