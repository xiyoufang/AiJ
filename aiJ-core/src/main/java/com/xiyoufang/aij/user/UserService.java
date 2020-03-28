package com.xiyoufang.aij.user;

import com.jfinal.aop.Before;
import com.jfinal.aop.Duang;
import com.jfinal.kit.StrKit;
import com.jfinal.plugin.activerecord.Record;
import com.jfinal.plugin.activerecord.SqlPara;
import com.jfinal.plugin.activerecord.tx.Tx;
import com.xiyoufang.aij.core.AiJCoreDb;
import com.xiyoufang.aij.core.Id;
import com.xiyoufang.aij.utils.Json;
import com.xiyoufang.aij.utils.Pbkdf2;
import org.joda.time.DateTime;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by 席有芳 on 2019-02-19.
 * 用户服务类
 *
 * @author 席有芳
 */
public class UserService {

    private static UserService me = null;

    /**
     * 获取实例
     *
     * @return UserService
     */
    public static synchronized UserService me() {
        if (me == null) {
            me = Duang.duang(UserService.class);
        }
        return me;
    }

    /**
     * 用户是否存在
     *
     * @param userId userId
     * @return boolean
     */
    public boolean exist(String userId) {
        return AiJCoreDb.uc().findByUnique("user_profile", "user_id", userId) != null;
    }

    /**
     * 获取资产的数量
     *
     * @param userId    userId
     * @param assetCode assetCode
     * @return 数量
     */
    public int getAssetQuantity(String userId, String assetCode) {
        if (!exist(userId)) {
            throw new UserNotExistException("用户不存在!");
        }
        SqlPara sqlPara = AiJCoreDb.uc().getSqlPara("core.get_user_asset", userId, assetCode);
        Integer quantity = AiJCoreDb.uc().queryInt(sqlPara.getSql(), sqlPara.getPara());
        return quantity == null ? 0 : quantity;
    }

    /**
     * 资产变更
     *
     * @param userId      用户ID
     * @param assetCode   资产Code
     * @param quantity    数量
     * @param description 变更描述
     * @return 数量
     */
    @Before(Tx.class)
    public int changeAssetQuantity(String userId, String assetCode, int quantity, String description) {
        int assetQuantity = getAssetQuantity(userId, assetCode);
        if (assetQuantity < -quantity) {
            throw new AssetNotEnoughException("当前" + assetCode + "资产的数量为" + assetQuantity + ",不足" + quantity + "!");
        }
        Record userAssetRecord = new Record().set("user_id", userId).set("asset_code", assetCode).set("quantity", assetQuantity + quantity);
        AiJCoreDb.uc().saveOrUpdate("user_asset", "user_id, asset_code", userAssetRecord);
        Record userAssetChangeRecord = new Record().set("user_id", userId).set("asset_code", assetCode).set("old_quantity", assetQuantity)
                .set("new_quantity", assetQuantity + quantity).set("description", description).set("created_time", DateTime.now().toString("yyyy-MM-dd HH:mm:ss"));
        AiJCoreDb.uc().save("user_asset_change", userAssetChangeRecord);
        return assetQuantity + quantity;
    }

    /**
     * 资产赠送服务
     *
     * @param sellerId  sellerId
     * @param buyerId   buyerUserId
     * @param assetCode assetCode
     * @param quantity  quantity
     * @return int
     */
    @Before(Tx.class)
    public int assetTrans(String sellerId, String buyerId, String assetCode, int quantity) {
        if (quantity < 1) {
            throw new AssetQuantityException("充值数量不能少于1");
        }
        int assetQuantity = changeAssetQuantity(sellerId, assetCode, -quantity, MessageFormat.format("卖:{0},资产:{1},数量:{2}", buyerId, assetCode, quantity));
        changeAssetQuantity(buyerId, assetCode, quantity, MessageFormat.format("买:{0},资产:{1},数量:{2}", sellerId, assetCode, quantity));
        Record userAssetTransRecord = new Record().set("seller_id", sellerId).set("buyer_id", buyerId).set("asset_code", assetCode).set("quantity", quantity).set("created_time", DateTime.now().toString("yyyy-MM-dd HH:mm:ss"));
        AiJCoreDb.uc().save("user_asset_trans", userAssetTransRecord);
        return assetQuantity;
    }

    /**
     * 实名认证
     *
     * @param userId     userId
     * @param certName   certName
     * @param certCard   certCard
     * @param certMobile certMobile
     * @param certType   certType
     */
    @Before(Tx.class)
    public boolean certification(String userId, String certName, String certCard, String certMobile, String certType) {
        Record record = new Record();
        record.set("user_id", userId);
        record.set("cert_name", certName);
        record.set("cert_card", certCard);
        record.set("cert_mobile", certMobile);
        record.set("cert_type", certType);
        record.set("cert_status", 0);
        record.set("started_time", new DateTime().toString("yyyy-MM-dd HH:mm:ss"));
        record.set("ended_time", "9999-01-01 00:00:00");
        record.set("created_time", new DateTime().toString("yyyy-MM-dd HH:mm:ss"));
        AiJCoreDb.uc().saveZipper("user_cert", "user_id,ended_time", record);
        return AiJCoreDb.uc().updateByUnique("user_profile", "user_id", new Record().set("user_id", userId).set("cert_status", 0));
    }

    /**
     * 注册微信用户
     *
     * @param unionId  unionId
     * @param openId   openId
     * @param avatar   avatar
     * @param sex      sex
     * @param nickName nickName
     * @return record
     */
    @Before(Tx.class)
    public Record registerWeiXinUser(String unionId, String openId, String avatar, int sex, String nickName) {
        long userId = Id.nextId();
        AiJCoreDb.uc().save("user_wx_auth", "user_id",
                new Record().set("user_id", userId)
                        .set("union_id", unionId)
                        .set("open_id", openId)
                        .set("enable", 1).set("created_time", new Date()));
        AiJCoreDb.uc().save("user_profile", "id",
                new Record().set("user_id", userId)
                        .set("user_name", nickName)
                        .set("nick_name", nickName)
                        .set("gender", sex)
                        .set("avatar", avatar)
                        .set("status", 1)
                        .set("created_source", "wx")
                        .set("created_time", new Date()));
        return AiJCoreDb.uc().findFirst(AiJCoreDb.uc().getSqlPara("core.user_auth_by_wx", unionId));
    }

    /**
     * 通过邮箱获取用户信息
     *
     * @param email email
     * @return recode
     */
    public Record findUserByEmail(String email) {
        return AiJCoreDb.uc().findFirst(AiJCoreDb.uc().getSqlPara("core.user_auth_by_email", email));
    }

    /**
     * 通过微信的unionId获取用户信息
     *
     * @param unionId unionId
     * @return Record
     */
    public Record findUserByWeiXin(String unionId) {
        return AiJCoreDb.uc().findFirst(AiJCoreDb.uc().getSqlPara("core.user_auth_by_wx", unionId));
    }


    /**
     * 通过手机号码登录
     *
     * @param mobile mobile
     * @return Record
     */
    public Record findUserByMobile(String mobile) {
        return AiJCoreDb.uc().findFirst(AiJCoreDb.uc().getSqlPara("core.user_auth_by_mobile", mobile));
    }


    /**
     * 密码鉴定
     *
     * @param password password
     * @param user     用户信息
     * @return boolean
     */
    public boolean authenticate(String password, Record user) {
        if (user == null || StrKit.isBlank(password)) {
            return false;
        }
        String encryptedPassword = user.getStr("password");
        String salt = user.getStr("salt");
        return Pbkdf2.authenticate(password, encryptedPassword, salt);
    }

    /**
     * 通过用户获取角色
     *
     * @param user user
     * @return Roles
     */
    public List<Record> findRolesByUser(Record user) {
        List<Record> records = new ArrayList<>();
        Record roleRecord = AiJCoreDb.uc().findByUnique("user_role", "user_id", user.getStr("user_id"));
        if (roleRecord == null || 1 != roleRecord.getInt("status")) return null;
        List<String> roles = Json.toArray(roleRecord.getStr("roles"), String.class); // 获取角色列表
        roles.forEach(role -> {
            records.add(AiJCoreDb.uc().findByUnique("role", "name", role));
        });
        return records;
    }

    /**
     * 通过用户ID更新用户状态
     *
     * @param record record
     * @return boolean
     */
    public boolean update(Record record) {
        record.set("modified_time", new Date());
        return AiJCoreDb.uc().update("user_profile", "id", record);
    }
}
