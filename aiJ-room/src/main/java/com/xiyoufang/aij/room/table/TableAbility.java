package com.xiyoufang.aij.room.table;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.CoreConfig;
import com.xiyoufang.aij.core.Id;
import com.xiyoufang.aij.response.Response;
import com.xiyoufang.aij.room.config.AiJRoomDb;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.utils.Json;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public abstract class TableAbility {
    /**
     * 桌子被锁定（即游戏已经开始）
     */
    private boolean start = false;
    /**
     * 游戏进行中，这时候不能起立，或者坐下
     */
    private boolean gameStart = false;
    /**
     * 日志
     */
    protected final Logger LOGGER = LoggerFactory.getLogger(TableAbility.class);
    /**
     * 桌子
     */
    protected Table table;

    /**
     * 玩家数量
     */
    protected int chairCount;
    /**
     * 计分板
     */
    protected Scoreboard scoreboard;
    /**
     * 初始化时间
     */
    protected String initializedTime;
    /**
     * 开始时间
     */
    protected String startedTime;
    /**
     * 规则
     */
    protected Rule rule;
    /**
     * 桌号
     */
    protected int tableNo = Table.INVALID_TABLE;
    /**
     * 存放统计数据
     */
    protected int[][] actionStatistics;

    /**
     * 当前局数
     */
    protected int currGameNumber = 0;

    /**
     * 初始化
     *
     * @param table table
     */
    void init(Table table) {
        this.initializedTime = new DateTime().toString("yyyy-MM-dd HH:mm:ss");
        this.table = table;
        this.tableNo = table.getTableNo();
        this.scoreboard = new Scoreboard();
        rule = this.table.getRule() == null ? new Rule() : this.table.getRule();
        onInit(rule);
    }

    /**
     * 发送给桌子全部玩家
     *
     * @param response response
     */
    public void sendTable(Response response) {
        this.table.sendTable(response);
    }

    /**
     * 发送给指定椅子
     *
     * @param response response
     * @param chairs   chairs
     */
    public void sendChairs(Response response, int... chairs) {
        this.table.sendChairs(response, chairs);
    }

    /**
     * 发送给排除之后的
     *
     * @param response response
     * @param chairs   chairs
     */
    public void sendExceptChairs(Response response, int... chairs) {
        this.table.sendExceptChairs(response, chairs);
    }

    /**
     * 最大椅子数
     *
     * @return int
     */
    public abstract int getMaxChair();

    /**
     * @return 是否已经准备好
     */
    public abstract boolean isReady();

    /**
     * 玩家进入之前
     *
     * @param hero hero
     * @return true 可以加入/false 禁止加入
     */
    public abstract B beforeEnter(Hero hero);

    /**
     * 玩家加入之后
     *
     * @param chair chair 椅子位置
     * @param hero  hero 玩家
     */
    public abstract void afterEnter(int chair, Hero hero);

    /**
     * 离开桌子之前
     *
     * @param chair chair 椅子位置
     * @param hero  hero 玩家
     * @return B
     */
    public abstract B beforeLeave(int chair, Hero hero);

    /**
     * 离开加入之后
     *
     * @param chair chair 椅子位置
     * @param hero  hero 玩家
     */
    public abstract void afterLeave(int chair, Hero hero);

    /**
     * 坐下
     *
     * @param chair chair
     * @param hero  hero
     */
    public abstract void sitDown(int chair, Hero hero);

    /**
     * 起立
     *
     * @param chair chair
     * @param hero  hero
     */
    public abstract void standUp(int chair, Hero hero);

    /**
     * 离线
     *
     * @param chair chair
     * @param hero  hero
     */
    public abstract void offline(int chair, Hero hero);

    /**
     * 上线
     *
     * @param chair chair
     * @param hero  hero
     */
    public abstract void online(int chair, Hero hero);

    /**
     * 发送当前游戏场景
     *
     * @param chair chair
     */
    public abstract void currentGameScene(int chair);

    /**
     * 桌子开始
     */
    public void start() {
        this.start = true;
        startedTime = new DateTime().toString("yyyy-MM-dd HH:mm:ss");
        chairCount = table.heroesCount();
        actionStatistics = new int[chairCount][32]; //统计最大为32个标识位
        onStart();
        gameStart();
    }

    /**
     * 游戏开始
     */
    public void gameStart() {
        gameStart = true;
        gameReset();
        onGameStart();
    }

    /**
     * 重置游戏
     */
    public void gameReset() {
        currGameNumber++;   //当前局数+1
        onGameReset();
    }

    /**
     * 结束游戏
     */
    public void gameEnd() {
        gameStart = false;
        onGameEnd();
        if (checkEnd()) {
            end(Table.EndReason.NORMAL);
        }
    }

    /**
     * 判断结束
     *
     * @return EndReason
     */
    protected abstract boolean checkEnd();

    /**
     * 桌子结束
     *
     * @param endReason endReason
     */
    void end(Table.EndReason endReason) {
        EndMessage endMessage = onEnd(endReason);
        writeRoomRecord(endMessage);
        start = false;
        table.destroy();
    }

    /**
     * 写入游戏信息
     *
     * @param endMessage endMessage
     */
    public void writeRoomRecord(EndMessage endMessage) {
        long detailId = Id.nextId();    //详情的ID
        long recordId = Id.nextId();    //游戏记录的ID
        String summaryInfo = getSummaryInfo();
        String nowTime = new DateTime().toString("yyyy-MM-dd HH:mm:ss");
        AiJRoomDb.room().update(AiJRoomDb.room().getSqlPara("room.save_room_record_detail", detailId, rule.toJson(), summaryInfo, endMessage.getDetail(), nowTime));
        AiJRoomDb.room().update(AiJRoomDb.room().getSqlPara("room.save_room_record", recordId, AppConfig.use().getInt(CoreConfig.SERVICE_ID), AppConfig.use().getStr(CoreConfig.SERVICE_NAME), this.table.getOwner().getUserId(), 0, 0, 0, this.table.getTableNo(), endMessage.getEndReason().name(), initializedTime, startedTime, nowTime, nowTime, detailId));//存储记录
        for (int i = 0; i < chairCount; i++) {              //设置游戏记录的玩家信息
            Hero hero = this.table.getHero(i);
            long recordUserId = Id.nextId();
            AiJRoomDb.room().update(AiJRoomDb.room().getSqlPara("room.save_room_record_user", recordUserId, recordId, hero.getUserId(), hero.getNickName(), i, readScore(i), nowTime));
        }
        for (int i = 1; i < currGameNumber + 1; i++) {  //局数量从1开始计数
            for (int ii = 0; ii < chairCount; ii++) {
                Hero hero = this.table.getHero(ii);
                long recordScoreId = Id.nextId();
                AiJRoomDb.room().update(AiJRoomDb.room().getSqlPara("room.save_room_record_score", recordScoreId, recordId, hero.getUserId(), i, readScore(ii, i), nowTime));
            }
        }
    }

    /**
     * 摘要信息
     *
     * @return json
     */
    private String getSummaryInfo() {
        List<List<RoomRecordSummary>> summaries = new ArrayList<>(); //概要信息（玩家与分数）
        for (int i : this.scoreboard.getNumbers()) {
            List<RoomRecordSummary> summary = new ArrayList<>();
            for (int ii = 0; ii < chairCount; ii++) {
                Hero hero = this.table.getHero(ii);
                RoomRecordSummary recordSummary = new RoomRecordSummary();
                recordSummary.setUserId(hero.getUserId());
                recordSummary.setNickName(hero.getNickName());
                recordSummary.setScore(readScore(ii, i));
                summary.add(recordSummary);
            }
            summaries.add(summary);
        }
        return Json.toJson(summaries);
    }

    /**
     * 桌子初始化成功
     *
     * @param rule 规则
     */
    public abstract void onInit(Rule rule);

    /**
     * 桌子开始事件
     */
    protected abstract void onStart();

    /**
     * 游戏开始
     */
    public abstract void onGameStart();

    /**
     * 开始重置桌子
     */
    public abstract void onGameReset();

    /**
     * 游戏结束
     */
    public abstract void onGameEnd();

    /**
     * 桌子结束
     *
     * @param endReason endReason
     * @return 游戏详情信息
     */
    public abstract EndMessage onEnd(Table.EndReason endReason);

    /**
     * 下一个椅子编号
     *
     * @param chair chair
     * @return next chair
     */
    protected int nextChair(int chair) {
        return (chair + 1) % chairCount;
    }

    /**
     * 开始状态
     *
     * @return boolean
     */
    public boolean isStart() {
        return start;
    }

    /**
     * 游戏已经开始
     *
     * @return bool
     */
    public boolean isGameStart() {
        return gameStart;
    }

    /**
     * 校验开始
     *
     * @return bool
     */
    B checkStart() {
        if (isReady()) {   //
            if (!start) {
                start();     //桌子开始
                return B.b(true, "第一局游戏开始");
            } else if (!gameStart) {
                gameStart();  //下一局游戏开始
                return B.b(true, "下一局游戏开始");
            } else {
                return B.b(false, "暂不满足游戏开始条件");
            }
        }
        return B.b(false, "暂不满足游戏开始条件");
    }

    /**
     * 校验同意解散
     *
     * @param agreeCount  agreeCount
     * @param refuseCount refuseCount
     * @return true 解散
     */
    protected boolean checkAgreeDismiss(int agreeCount, int refuseCount) {
        return agreeCount >= chairCount - 1; //最多一个人没同意
    }

    /**
     * 校验拒绝解散
     *
     * @param agreeCount  agreeCount
     * @param refuseCount refuseCount
     * @return true 拒绝
     */
    protected boolean checkRefuseDismiss(int agreeCount, int refuseCount) {
        return refuseCount > 1; //二个人没同意
    }

    /**
     * 记分
     *
     * @param number 局数
     * @param type   分数类型
     * @param chair  椅子
     * @param score  分值
     */
    protected void writeScore(int number, int type, int chair, int score) {
        this.scoreboard.writeScore(number, type, chair, score);
    }

    /**
     * 读取分数
     *
     * @param chair 椅子
     * @return score
     */
    protected int readScore(int chair) {
        return this.scoreboard.readScore(chair);
    }

    /**
     * 读取类型分数
     *
     * @param chair  椅子
     * @param number 局数
     * @return score
     */
    protected int readScore(int chair, int number) {
        return this.scoreboard.readScore(chair, number);
    }

    /**
     * 读取类型分数
     *
     * @param chair  椅子
     * @param number 局数
     * @param type   类型
     * @return score
     */
    protected int readScore(int chair, int number, int type) {
        return this.scoreboard.readScore(chair, number, type);
    }

    /**
     * 写入统计的数据
     *
     * @param chair chair
     * @param type  type
     */
    protected void writeActionStatistic(int chair, int type) {
        writeActionStatistic(chair, type, 1);
    }

    /**
     * 写入统计的数据
     *
     * @param chair chair
     * @param type  type
     * @param count count
     */
    protected void writeActionStatistic(int chair, int type, int count) {
        actionStatistics[chair][type] = actionStatistics[chair][type] + count;
    }

    /**
     * 输出关键日志
     *
     * @param args args
     */
    protected void printKeyLog(Object... args) {
        LOGGER.info("{}游戏记录:{}", args);
    }

    /**
     * 获取桌号生成器
     *
     * @return TableNoGenerator
     */
    protected TableNoGenerator getTableNoGenerator() {
        return new DefaultTableNoGenerator();
    }

}
