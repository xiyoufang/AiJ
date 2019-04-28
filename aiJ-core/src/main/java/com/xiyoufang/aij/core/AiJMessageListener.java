package com.xiyoufang.aij.core;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.core.ChannelContext;
import org.tio.core.Node;
import org.tio.core.intf.Packet;
import org.tio.websocket.common.WsRequest;
import org.tio.websocket.common.WsResponse;
import org.tio.websocket.server.WsServerAioListener;

/**
 * Created by 席有芳 on 2019-01-17.
 *
 * @author 席有芳
 */
public class AiJMessageListener extends WsServerAioListener {

    /**
     * 日志
     */
    private final static Logger LOGGER = LoggerFactory.getLogger(AiJMessageListener.class);

    /**
     * 设置关闭监听
     */
    private TioListener tioListener;

    /**
     * 解码完成后
     *
     * @param channelContext channelContext
     * @param packet         packet
     * @param packetSize     packetSize
     */
    @Override
    public void onAfterDecoded(ChannelContext channelContext, Packet packet, int packetSize) {
        if (packet instanceof WsRequest) {
            Node clientNode = channelContext.getClientNode();
            LOGGER.debug("收到来自{}:{},信息为:{}", clientNode.getIp(), clientNode.getPort(), ((WsRequest) packet).getWsBodyText());
        }
    }

    /**
     * 发送之后
     *
     * @param channelContext channelContext
     * @param packet         packet
     * @param isSentSuccess  isSentSuccess
     */
    @Override
    public void onAfterSent(ChannelContext channelContext, Packet packet, boolean isSentSuccess) {
        if (packet instanceof WsResponse && !((WsResponse) packet).isHandShake()) {
            Node clientNode = channelContext.getClientNode();
            LOGGER.debug("发送信息{}:{},信息为:{}", clientNode.getIp(), clientNode.getPort(), new String(((WsResponse) packet).getBody()));
        }
    }

    /**
     * 连接断开之前
     *
     * @param channelContext channelContext
     * @param throwable      throwable
     * @param remark         remark
     * @param isRemove       isRemove
     */
    @Override
    public void onBeforeClose(ChannelContext channelContext, Throwable throwable, String remark, boolean isRemove) {
        if (this.tioListener != null) {
            this.tioListener.onClose(channelContext, throwable, remark, isRemove);
        }
    }

    /**
     * 设置监听
     *
     * @param tioListener tioListener
     */
    public void setTioListener(TioListener tioListener) {
        this.tioListener = tioListener;
    }
}
