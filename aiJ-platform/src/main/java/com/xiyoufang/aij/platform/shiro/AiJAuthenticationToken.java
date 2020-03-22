package com.xiyoufang.aij.platform.shiro;

import com.jfinal.plugin.activerecord.Record;
import org.apache.shiro.authc.AuthenticationToken;

/**
 * Created by 席有芳 on 2020-03-22.
 *
 * @author 席有芳
 */
public class AiJAuthenticationToken implements AuthenticationToken {

    /**
     * 授权信息
     */
    private Record record;

    public AiJAuthenticationToken(Record record) {
        this.record = record;
    }

    /**
     * 授权信息
     *
     * @return Object
     */
    @Override
    public Object getPrincipal() {
        return this.record;
    }

    /**
     * @return the credential submitted by the user during the authentication process.
     */
    @Override
    public Object getCredentials() {
        return this.record;
    }
}
