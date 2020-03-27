package com.xiyoufang.aij.platform.config;

/**
 * Created by 席有芳 on 2020-03-26.
 * 与VUE交互的状态码
 * request.js
 *
 * @author 席有芳
 */
public class ResponseStatusCode {

    /**
     * Code Key
     */
    public final static String CODE_KEY = "code";
    /**
     * Message Key
     */
    public final static String MESSAGE_KEY = "message";
    /**
     * Data Key
     */
    public final static String DATA_KEY = "data";
    /**
     * OK
     */
    public final static int OK = 20000;

    /**
     * Illegal token
     */
    public final static int ILLEGAL_TOKEN = 50008;

    /**
     * Other clients logged in
     */
    public final static int OTHER_CLIENTS_LOGGED_IN = 50012;

    /**
     * Token expired;
     */
    public final static int TOKEN_EXPIRED = 50014;

    /**
     * login failure
     */
    public static final int LOGIN_FAILURE = 50016;

    /**
     * request data validate failure
     */
    public static final int REQUEST_VALIDATE_FAILURE = 50018;

    /**
     * operation failure
     */
    public static final int OPERATION_FAILURE = 50020;
}
