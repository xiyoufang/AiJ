package com.xiyoufang.aij.plaza.handler;

import com.xiyoufang.aij.plaza.event.NoticeEvent;
import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2019-02-17.
 * 大厅系统公告
 *
 * @author 席有芳
 */
public class NoticeEventHandler extends AuthorizedEventHandler<NoticeEvent> {

    public NoticeEventHandler() {
        super(NoticeEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(NoticeEvent event, String userId, ChannelContext channelContext) {


    }
}
