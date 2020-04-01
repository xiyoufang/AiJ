package com.xiyoufang.aij.handler;

import com.jfinal.plugin.activerecord.Record;
import com.jfinal.weixin.sdk.api.ApiResult;
import com.jfinal.weixin.sdk.api.SnsAccessToken;
import com.jfinal.weixin.sdk.api.SnsAccessTokenApi;
import com.jfinal.weixin.sdk.api.SnsApi;
import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.CoreConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.event.WeiXinLoginEvent;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.user.User;
import com.xiyoufang.aij.user.UserService;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-07-25.
 *
 * @author 席有芳
 */
public abstract class WeiXinLoginEventHandler extends LoginEventHandler<WeiXinLoginEvent> {

    public WeiXinLoginEventHandler() {
        super(WeiXinLoginEvent.class);
    }

    /**
     * 授权时候通过
     *
     * @param key    key
     * @param record record
     * @return boolean
     */
    @Override
    protected boolean authenticate(String key, Record record) {
        return true;
    }

    /**
     * 转换后的对象Handler
     *
     * @param event          event
     * @param channelContext channelContext
     */
    @Override
    protected void handle(WeiXinLoginEvent event, ChannelContext channelContext) {
        SnsAccessToken snsAccessToken = SnsAccessTokenApi.getSnsAccessToken(AppConfig.use().getStr(CoreConfig.WX_APP_ID),
                AppConfig.use().getStr(CoreConfig.WX_SECRET), event.getCode());
        if (snsAccessToken.getErrorCode() == null) {
            ApiResult userInfo = SnsApi.getUserInfo(snsAccessToken.getAccessToken(), snsAccessToken.getOpenid());
            String openId = userInfo.getStr("openid");
            String unionId = userInfo.getStr("unionid");
            String avatar = userInfo.getStr("headimgurl");
            int sex = userInfo.getInt("sex");
            String nickName = userInfo.getStr("nickname");
            Record record = UserService.me().findUserByWeiXin(unionId);
            authenticate(channelContext, null, record == null ? UserService.me().registerWeiXinUser(unionId, openId, avatar, sex, nickName) : record);
        } else {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "微信授权失败!").toJson(), AppConfig.use().getCharset()));
        }
    }
}
