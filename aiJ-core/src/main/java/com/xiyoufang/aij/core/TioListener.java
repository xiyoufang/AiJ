package com.xiyoufang.aij.core;

import org.tio.core.ChannelContext;

/**
 * Created by 席有芳 on 2019-01-25.
 *
 * @author 席有芳
 */
public interface TioListener {

    /**
     * 连接断开之前
     *
     * @param channelContext channelContext
     * @param throwable      throwable
     * @param remark         remark
     * @param isRemove       isRemove
     */
    void onClose(ChannelContext channelContext, Throwable throwable, String remark, boolean isRemove);
}
