package com.xiyoufang.aij.platform.shiro;

import com.xiyoufang.aij.platform.domain.UserDO;
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
    private UserDO userDO;

    public AiJAuthenticationToken(UserDO userDO) {
        this.userDO = userDO;
    }

    /**
     * 授权信息
     *
     * @return Object
     */
    @Override
    public Object getPrincipal() {
        return this.userDO;
    }

    /**
     * @return the credential submitted by the user during the authentication process.
     */
    @Override
    public Object getCredentials() {
        return this.userDO;
    }
}
