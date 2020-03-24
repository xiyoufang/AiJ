package com.xiyoufang.aij.plaza.handler;

import com.xiyoufang.aij.cache.CacheKit;
import com.xiyoufang.aij.core.*;
import com.xiyoufang.aij.plaza.event.RoomServiceEvent;
import com.xiyoufang.aij.plaza.response.RoomServiceEventResponse;
import com.xiyoufang.aij.response.CommonResponse;
import org.apache.curator.x.discovery.ServiceDiscovery;
import org.apache.curator.x.discovery.ServiceInstance;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-27.
 *
 * @author 席有芳
 */
public class RoomServiceEventHandler extends AuthorizedEventHandler<RoomServiceEvent> {

    public RoomServiceEventHandler() {
        super(RoomServiceEvent.class);
    }

    /**
     * Handler
     *
     * @param event          event
     * @param userId         userId
     * @param channelContext channelContext
     */
    @Override
    protected void handle(RoomServiceEvent event, String userId, ChannelContext channelContext) {
        RegistryCenter registryCenter = RegistryCenterManager.use();
        try {
            RoomServiceEventResponse response = ResponseFactory.success(RoomServiceEventResponse.class, "发现房间");
            if (registryCenter.isConnected()) {
                ServiceDiscovery<ServiceDetail> serviceDiscovery = registryCenter.serviceDiscovery(ServiceDetail.class);
                serviceDiscovery.start();
                List<RoomServiceEventResponse.RoomItem> roomItems = new ArrayList<>();
                response.setRoomItems(roomItems);
                Collection<ServiceInstance<ServiceDetail>> services = serviceDiscovery.queryForInstances(ServiceType.ROOM.name());
                for (ServiceInstance<ServiceDetail> service : services) {
                    ServiceDetail payload = service.getPayload();
                    RoomServiceEventResponse.RoomItem roomItem = new RoomServiceEventResponse.RoomItem();
                    roomItem.setServiceId(payload.getServiceId());
                    roomItem.setServiceCode(payload.getServiceCode());
                    roomItem.setName(payload.getServiceName());
                    roomItem.setAddress(payload.getAddress());
                    roomItem.setPort(payload.getPort());
                    roomItem.setEnable(payload.isEnable());
                    roomItems.add(roomItem);
                }
                CacheKit.use().put("roomInfo", response);
                serviceDiscovery.close();
            } else {
                response = CacheKit.use().get("roomInfo");
                if (response == null) {
                    Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "没发现房间!").toJson(), AppConfig.use().getCharset()));
                    return;
                }
                LOGGER.info("从缓存中发现房间");
            }
            Tio.send(channelContext, WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
        } catch (Exception e) {
            LOGGER.error("服务发现异常!", e);
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "服务发现异常，请联系管理员!").toJson(), AppConfig.use().getCharset()));
        }
    }
}
