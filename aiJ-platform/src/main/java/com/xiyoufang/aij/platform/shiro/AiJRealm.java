package com.xiyoufang.aij.platform.shiro;

import com.alibaba.fastjson.JSONArray;
import com.jfinal.json.FastJsonFactory;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.platform.domain.UserDO;
import com.xiyoufang.aij.user.UserService;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by 席有芳 on 2017/9/13.
 *
 * @author 席有芳
 */
public class AiJRealm extends AuthorizingRealm {

    /**
     * 数据源
     */
    private String dataSource;

    /**
     * Convenience implementation that returns
     * <tt>getAuthenticationTokenClass().isAssignableFrom( token.getClass() );</tt>.  Can be overridden
     * by subclasses for more complex token checking.
     * <p>Most configurations will only need to set a different class via
     * {@link #setAuthenticationTokenClass}, as opposed to overriding this method.
     *
     * @param token the token being submitted for authentication.
     * @return true if this authentication realm can process the submitted token instance of the class, false otherwise.
     */
    @Override
    public boolean supports(AuthenticationToken token) {
        return token instanceof AiJAuthenticationToken;
    }

    /**
     * 授权，外部进行权限校验
     *
     * @param token token
     * @return AuthenticationInfo
     * @throws AuthenticationException AuthenticationException
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
        AiJAuthenticationToken aiJToken = (AiJAuthenticationToken) token;
        UserDO userDO = (UserDO) aiJToken.getPrincipal();
        List<Record> records = UserService.me().findRolesByUser(userDO.getRecord());
        if (records == null) {
            throw new AuthenticationException("账号禁止登录管理平台");
        }
        Set<String> roleNames = new HashSet<>();
        records.forEach(record -> roleNames.add(record.getStr("name")));
        Set<String> permissions = new HashSet<>();
        records.forEach(record -> permissions.addAll(FastJsonFactory.me().getJson().parse(record.getStr("permissions"), JSONArray.class).toJavaList(String.class)));
        Set<String> menus = new HashSet<>();
        records.forEach(record -> menus.addAll(FastJsonFactory.me().getJson().parse(record.getStr("menus"), JSONArray.class).toJavaList(String.class)));
        userDO.setRoles(roleNames);
        userDO.setPermissions(permissions);
        userDO.setMenus(menus);
        return new SimpleAuthenticationInfo(userDO, userDO, getName());
    }

    /**
     * Retrieves the AuthorizationInfo for the given principals from the underlying data store.  When returning
     * an instance from this method, you might want to consider using an instance of
     * {@link SimpleAuthorizationInfo SimpleAuthorizationInfo}, as it is suitable in most cases.
     *
     * @param principals the primary identifying principals of the AuthorizationInfo that should be retrieved.
     * @return the AuthorizationInfo associated with this principals.
     * @see SimpleAuthorizationInfo
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
        UserDO userDO = (UserDO) principals.getPrimaryPrincipal();
        SimpleAuthorizationInfo info = new SimpleAuthorizationInfo(userDO.getRoles());
        info.setStringPermissions(userDO.getPermissions());
        return info;
    }

    public String getDataSource() {
        return dataSource;
    }

    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }
}
