package com.xiyoufang.jfinal.shiro;

/**
 * Created by 席有芳 on 2017/9/16.
 *
 * @author 席有芳
 */
public class PermissionMapping {
    /**
     * 权限Key
     */
    private String k;
    /**
     * 权限Value
     */
    private String v;

    /**
     * @param k
     * 权限key
     * @param v
     * 权限value
     */
    PermissionMapping(String k, String v) {
        this.k = k;
        this.v = v;
    }

    public String getK() {
        return k;
    }

    public void setK(String k) {
        this.k = k;
    }

    public String getV() {
        return v;
    }

    public void setV(String v) {
        this.v = v;
    }
}
