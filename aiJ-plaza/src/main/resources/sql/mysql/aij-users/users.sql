### 保存游戏记录信息
#sql("get_user_asset_trans_pages")
SELECT u.seller_id,
       p.nick_name as seller_name,
       buyer_id,
       q.nick_name as buyer_name,
       u.asset_code,
       u.quantity,
       u.created_time
FROM user_asset_trans u
       LEFT JOIN user_profile p ON (p.user_id = u.seller_id)
       LEFT JOIN user_profile q ON (q.user_id = u.buyer_id)
WHERE (u.seller_id = #p(0) or u.buyer_id = #p(0))
  AND u.asset_code = #p(1)
ORDER BY u.id desc
#end