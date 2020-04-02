package com.xiyoufang.aij.room.hero;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.response.CommonResponse;
import com.xiyoufang.aij.room.config.RoomConfig;
import com.xiyoufang.aij.room.response.LoginEventResponse;
import com.xiyoufang.aij.room.response.LoginNotifyResponse;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableManager;
import com.xiyoufang.aij.user.User;
import org.tio.core.ChannelContext;
import org.tio.core.Tio;
import org.tio.utils.lock.SetWithLock;
import org.tio.websocket.common.WsResponse;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by 席有芳 on 2018-12-20.
 * 玩家管理，单例模式
 *
 * @author 席有芳
 */
public class HeroManager {
    /**
     * 实例
     */
    private static HeroManager instance;
    /**
     * 登录组
     */
    private final static String LOGIN_GROUP = "_LOGIN_GROUP_";
    /**
     * 默认最大在线数量
     */
    private static final int DEFAULT_MAX_HERO = 2048 * 4;
    /**
     * 单台服务器最大在线数量
     */
    private int maxHero = DEFAULT_MAX_HERO;
    /**
     * 玩家
     */
    private Map<String, Hero> heroes = new ConcurrentHashMap<>();

    /**
     * 初始化
     */
    void init() {
        if (AppConfig.use().yes(RoomConfig.HERO_MAX)) {
            maxHero = AppConfig.use().getInt(RoomConfig.HERO_MAX);
        }
    }

    /**
     * 获取单例
     *
     * @return HeroManager
     */
    public static synchronized HeroManager getInstance() {
        if (instance == null) {
            instance = new HeroManager();
            instance.init();
        }
        return instance;
    }

    /**
     * 添加玩家
     *
     * @param hero hero
     * @return boolean
     */
    public synchronized B addHero(Hero hero) {
        if (heroes.size() >= maxHero) {
            return B.b(false, "服务器爆满,请稍后再试!");
        }
        String userId = hero.getUserId();
        heroes.put(userId, hero);
        return B.b(true);
    }

    /**
     * 移除玩家
     *
     * @param hero hero
     */
    public void removeHero(Hero hero) {
        removeHero(hero.getUserId());
    }

    /**
     * 移除玩家
     *
     * @param userId userId
     */
    public void removeHero(String userId) {
        heroes.remove(userId);
    }

    /**
     * 获取玩家
     *
     * @param userId userId
     * @return Hero
     */
    public synchronized Hero getHero(String userId) {
        return heroes.get(userId);
    }

    /**
     * 登录成功
     *
     * @param channelContext channelContext
     * @param user           user
     */
    public void success(ChannelContext channelContext, User user) {
        Hero hero = new Hero();
        hero.setShowId(user.getShowId());
        hero.setUserName(user.getUserName());
        hero.setUserId(user.getUserId());
        hero.setNickName(user.getNickName());
        hero.setGender(user.getGender());
        hero.setAvatar(user.getAvatar());
        hero.setAddress(user.getAddress());
        hero.setLongitude(user.getLongitude());
        hero.setLatitude(user.getLatitude());
        hero.setDistributorId(user.getDistributorId());
        hero.setIp(user.getIp());
        hero.setCertStatus(user.getCertStatus());
        String userId = hero.getUserId();
        SetWithLock<ChannelContext> objs = Tio.getByUserid(channelContext.tioConfig, userId);
        if (objs != null) {
            for (ChannelContext obj : objs.getObj()) {
                if (obj == channelContext) {
                    continue;
                }
                Tio.unbindUser(obj);
                Tio.send(obj, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, "您的账号在其他地方登录,您已经被强制下线!").toJson(), AppConfig.use().getCharset()));
                Tio.remove(obj, "强制下线!");
            }
        }
        Tio.unbindUser(channelContext); //先解绑
        channelContext.setUserid(userId); //用户名称绑定
        //获取之前的桌子号
        Hero oldHero = HeroManager.getInstance().getHero(hero.getUserId());
        if (oldHero != null) {
            HeroManager.getInstance().removeHero(oldHero);
            hero.setTableNo(oldHero.getTableNo());
        }
        B b = HeroManager.getInstance().addHero(hero);
        if (!b.b) {
            Tio.send(channelContext, WsResponse.fromText(ResponseFactory.error(CommonResponse.class, (String) b.m).toJson(), AppConfig.use().getCharset()));
            return;
        }
        LoginEventResponse response = ResponseFactory.success(LoginEventResponse.class, "登录成功");
        response.setUserId(channelContext.userid);
        response.setShowId(hero.getShowId());
        response.setUserName(hero.getUserName());
        response.setAvatar(hero.getAvatar());
        response.setGender(hero.getGender());
        response.setNickName(hero.getNickName());
        Tio.send(channelContext, WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
        //添加到登录成功的组
        Tio.bindGroup(channelContext, LOGIN_GROUP);
        Tio.bindUser(channelContext, channelContext.userid);
        //广播登录信息
        LoginNotifyResponse notifyResponse = ResponseFactory.success(LoginNotifyResponse.class, "玩家登录");
        notifyResponse.setUserName(hero.getUserName());
        Tio.sendToGroup(channelContext.tioConfig, LOGIN_GROUP, WsResponse.fromText(notifyResponse.toJson(), AppConfig.use().getCharset()));
        if (hero.getTableNo() != Table.INVALID_TABLE && TableManager.getInstance().getTable(hero.getTableNo()) != null) {
            TableManager.getInstance().getCurrTable(hero).enter(hero);
        }
    }
}
