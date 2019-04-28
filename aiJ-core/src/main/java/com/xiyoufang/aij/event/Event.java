package com.xiyoufang.aij.event;

import com.xiyoufang.aij.utils.Json;

/**
 * Created by 席有芳 on 2018-12-18.
 * 事件的基类
 *
 * @author 席有芳
 */
public class Event {
    /**
     * 主事件类型
     */
    private int mainType;
    /**
     * 子事件类型
     */
    private int subType;
    /**
     * 报文内容
     */
    private String text;
    /**
     * 校验码
     */
    private String verify;

    public int getMainType() {
        return mainType;
    }

    public void setMainType(int mainType) {
        this.mainType = mainType;
    }

    public int getSubType() {
        return subType;
    }

    public void setSubType(int subType) {
        this.subType = subType;
    }

    public String getVerify() {
        return verify;
    }

    public void setVerify(String verify) {
        this.verify = verify;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    /**
     * 转成对象
     *
     * @param text text
     * @return Event
     */
    public static <T extends Event> T toEvent(String text, Class<T> clazz) {
        T event = Json.toBean(text, clazz);
        event.setText(text);
        return event;
    }

    /**
     * 转成JSON
     *
     * @return json text
     */
    public String toJson() {
        return Json.toJson(this);
    }

}