package com.xiyoufang.aij.plaza.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.plaza.event.UserAssetEvent;
import com.xiyoufang.aij.plaza.response.UserAssetEventResponse;
import com.xiyoufang.aij.user.UserService;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-02-22.
 * 用户资产查询
 *
 * @author 席有芳
 */
public class UserAssetEventHandler extends AuthorizedEventHandler<UserAssetEvent> {

    /**
     *
     */
    public UserAssetEventHandler() {
        super(UserAssetEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(UserAssetEvent event, String userId, ChannelContext channelContext) {
        UserAssetEventResponse userAssetEventResponse = ResponseFactory.success(UserAssetEventResponse.class, "玩家资产信息");
        for (String assetCode : event.getAssetCodes()) {
            userAssetEventResponse.getAssetsQuantity().put(assetCode, UserService.me().getAssetQuantity(userId, assetCode));
        }
        Tio.send(channelContext, WsResponse.fromText(userAssetEventResponse.toJson(), AppConfig.use().getCharset()));
    }
}
