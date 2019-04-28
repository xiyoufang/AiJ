package com.xiyoufang.aij.response;


import com.xiyoufang.aij.utils.Json;

/**
 * Created by 席有芳 on 2018-12-19.
 *
 * @author 席有芳
 */
public class Response {

    public static final int SUCCESS = 1;
    public static final int ERROR = 0;
    /**
     * 主事件类型
     */
    private int mainType;
    /**
     * 子事件类型
     */
    private int subType;

    /**
     * Code
     */
    private int code;
    /**
     * 信息
     */
    private String message;
    /**
     * 原始内容
     */
    private String text;

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

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getText() {
        return text;
    }

    public String toJson() {
        return Json.toJson(this);
    }

    /**
     * 转成对象
     *
     * @param text text
     * @return Event
     */
    public static <T extends Response> T toResponse(String text, Class<T> clazz) {
        T t = Json.toBean(text, clazz);
        t.setText(text);
        return t;
    }

}
