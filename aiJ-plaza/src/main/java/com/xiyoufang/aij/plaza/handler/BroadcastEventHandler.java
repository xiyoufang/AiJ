package com.xiyoufang.aij.plaza.handler;

import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.plaza.config.AiJPlazaDb;
import com.xiyoufang.aij.plaza.event.BroadcastEvent;
import com.xiyoufang.aij.plaza.response.BroadcastEventResponse;
import com.xiyoufang.aij.utils.Json;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2019-02-19.
 * 获取广播
 *
 * @author 席有芳
 */
public class BroadcastEventHandler extends AuthorizedEventHandler<BroadcastEvent> {

    public BroadcastEventHandler() {
        super(BroadcastEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(BroadcastEvent event, String userId, ChannelContext channelContext) {
        SqlPara sqlPara = AiJPlazaDb.platform().getSqlPara("plaza.get_setting_by_domain_code", "platform", "plaza_broadcast");
        Record record = AiJPlazaDb.platform().findFirst(sqlPara);
        BroadcastEventResponse broadcastEventResponse = ResponseFactory.success(BroadcastEventResponse.class, "大厅广播");
        broadcastEventResponse.setBroadcasts(new ArrayList<String>());
        if (record != null) {
            List<String> broadcasts = broadcastEventResponse.getBroadcasts();
            ArrayList array = Json.toBean(record.getStr("value"), ArrayList.class);
            for (Object item : array) {
                broadcasts.add((String) item);
            }
        }
        Tio.send(channelContext, WsResponse.fromText(broadcastEventResponse.toJson(), AppConfig.use().getCharset()));
    }
}
