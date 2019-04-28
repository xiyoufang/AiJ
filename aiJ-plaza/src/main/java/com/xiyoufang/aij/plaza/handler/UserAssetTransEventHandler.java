package com.xiyoufang.aij.plaza.handler;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.plaza.event.UserAssetTransEvent;
import com.xiyoufang.aij.plaza.response.UserAssetTransEventResponse;
import com.xiyoufang.aij.user.AssetNotEnoughException;
import com.xiyoufang.aij.user.AssetQuantityException;
import com.xiyoufang.aij.user.UserNotExistException;
import com.xiyoufang.aij.user.UserService;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

/**
 * Created by 席有芳 on 2019-02-27.
 * 资产赠送
 *
 * @author 席有芳
 */
public class UserAssetTransEventHandler extends AuthorizedEventHandler<UserAssetTransEvent> {

    /**
     * 资产赠送Handler
     */
    public UserAssetTransEventHandler() {
        super(UserAssetTransEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(UserAssetTransEvent event, String userId, ChannelContext channelContext) {
        UserAssetTransEventResponse response = ResponseFactory.success(UserAssetTransEventResponse.class, "资产赠送事件");
        response.setAssetCode(event.getAssetCode());
        try {
            int quantity = UserService.me().assetTrans(userId, event.getBuyerId(), event.getAssetCode(), event.getQuantity());
            response.setTips("操作成功!");
            response.setQuantity(quantity);
            response.setSuccess(true);
        } catch (UserNotExistException e) {
            LOGGER.info("用户不存在", e);
            response.setTips("玩家ID不存在!");
            response.setQuantity(UserService.me().getAssetQuantity(userId, event.getAssetCode()));
            response.setSuccess(false);
        } catch (AssetNotEnoughException e) {
            LOGGER.info("资产不足", e);
            response.setTips("操作失败,数量不足!");
            response.setQuantity(UserService.me().getAssetQuantity(userId, event.getAssetCode()));
            response.setSuccess(false);
        } catch (AssetQuantityException e) {
            LOGGER.info("资产数量不能小于1", e);
            response.setTips("数量错误!");
            response.setQuantity(UserService.me().getAssetQuantity(userId, event.getAssetCode()));
            response.setSuccess(false);
        } catch (Exception e) {
            LOGGER.error("资产交易异常", e);
            response.setTips("系统异常,请稍后再试!");
            response.setQuantity(UserService.me().getAssetQuantity(userId, event.getAssetCode()));
            response.setSuccess(false);
        }
        Tio.send(channelContext, WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
    }
}
