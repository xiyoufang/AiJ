package com.xiyoufang.aij.room.table;

import com.xiyoufang.aij.core.AppConfig;
import com.xiyoufang.aij.core.B;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.response.Response;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.response.*;
import org.fest.reflect.core.Reflection;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.tio.core.Tio;
import org.tio.websocket.common.WsResponse;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class Table {

    public enum EndReason {
        NORMAL,         //正常结束
        FORCE_DISMISS,  //强制解散
        VOTE_DISMISS,   //投票解散
        TIMEOUT     //超时未开始
    }

    public enum HeroChairStatus {
        SIT_DOWN,       //坐下
        STAND_UP        //起立
    }

    public enum HeroNetStatus {
        ONLINE, //在线
        OFFLINE //离线
    }

    class HeroStatus {  //玩家状态
        HeroChairStatus chairStatus;
        HeroNetStatus netStatus;

        public HeroStatus(HeroChairStatus chairStatus, HeroNetStatus netStatus) {
            this.chairStatus = chairStatus;
            this.netStatus = netStatus;
        }
    }

    static class HeroMate {
        Hero hero;
        HeroStatus heroStatus;
        boolean clientReady;

        public HeroMate(Hero hero, HeroStatus heroStatus, boolean clientReady) {
            this.hero = hero;
            this.heroStatus = heroStatus;
            this.clientReady = clientReady;
        }

        public Hero getHero() {
            return hero;
        }

        public void setHero(Hero hero) {
            this.hero = hero;
        }

        public HeroStatus getHeroStatus() {
            return heroStatus;
        }

        public void setHeroStatus(HeroStatus heroStatus) {
            this.heroStatus = heroStatus;
        }

        public boolean isClientReady() {
            return clientReady;
        }

        public void setClientReady(boolean clientReady) {
            this.clientReady = clientReady;
        }
    }

    /**
     * 解散数据
     */
    static class DismissVoteMate {
        /**
         * 开始解散时间
         */
        long voteTime = 0;   //开始时间
        /**
         * 投票状态
         */
        DismissStatus dismissStatus = DismissStatus.NULL;
        /**
         * 票箱
         */
        Map<Integer, Boolean> ballotBox = new ConcurrentHashMap<>();

        /**
         * 投票
         *
         * @param chair chair
         * @param agree agree
         */
        void vote(int chair, boolean agree) {
            if (!ballotBox.containsKey(chair)) {
                if (voteTime == 0) {
                    voteTime = System.currentTimeMillis();
                }
                dismissStatus = DismissStatus.VOTING;
                ballotBox.put(chair, agree);
            }
        }

        /**
         * 计数
         *
         * @param agree agree
         * @return count
         */
        int count(boolean agree) {
            int i = 0;
            for (Boolean aBoolean : ballotBox.values()) {
                if (aBoolean == agree) {
                    i++;
                }
            }
            return i;
        }

        void reset() {
            voteTime = 0;
            dismissStatus = DismissStatus.NULL;
            ballotBox.clear();
        }

        /**
         * 获取同意的chairs
         *
         * @return int[]
         */
        public int[] agrees() {
            return chairs(true);
        }

        /**
         * 获取拒绝的 chairs
         *
         * @return int[]
         */
        public int[] refuses() {
            return chairs(false);
        }

        /**
         * 获取指定状态的 chairs
         *
         * @return int[]
         */
        private int[] chairs(boolean agree) {
            List<Integer> agreeList = new ArrayList<>();
            for (Map.Entry<Integer, Boolean> entry : ballotBox.entrySet()) {
                if (entry.getValue() == agree) {
                    agreeList.add(entry.getKey());
                }
            }
            int[] agrees = new int[agreeList.size()];
            for (int i = 0; i < agreeList.size(); i++) {
                agrees[i] = agreeList.get(i);
            }
            return agrees;
        }
    }

    enum DismissStatus {
        NULL(0),           //无状态
        VOTING(1)         //投票中
        ;

        int value;

        DismissStatus(int value) {
            this.value = value;
        }

    }

    /**
     * 日志
     */
    private final static Logger LOGGER = LoggerFactory.getLogger(Table.class);

    /**
     * 无效的椅子
     */
    public static final int INVALID_CHAIR = -1;
    /**
     * 无效的桌子
     */
    public static final int INVALID_TABLE = -1;
    /**
     * 规则
     */
    private Rule rule;
    /**
     * 编号，需要保证同时唯一
     */
    private int tableNo;
    /**
     * Hero进入的序号
     */
    private int maxChair;
    /**
     * 归属
     */
    private Hero owner;
    /**
     * 玩家
     */
    private Map<Integer, HeroMate> heroes = new ConcurrentHashMap<>();
    /**
     * 桌子功能
     */
    private TableAbility tableAbility;
    /**
     * 桌号生成器
     */
    private TableNoGenerator tableNoGenerator = new DefaultTableNoGenerator();
    /**
     * 解散数据
     */
    private DismissVoteMate dismissVoteMate = new DismissVoteMate();
    /**
     * 投票超时时间
     */
    private int voteTimeout = 5 * 60 * 1000;

    /**
     * 构造桌子
     *
     * @param owner        owner
     * @param ruleText     规则
     * @param tableAbility 桌子功能实现
     */
    public Table(Hero owner, String ruleText, Class<? extends TableAbility> tableAbility) throws TableNoGenerateException {
        this.owner = owner;
        this.rule = Rule.toRule(ruleText);
        this.tableAbility = Reflection.constructor().in(tableAbility).newInstance();
        this.tableNo = this.tableAbility.getTableNoGenerator().generate();
        this.tableAbility.init(this);
        this.maxChair = this.tableAbility.getMaxChair();
    }

    /**
     * 定时 500 ms执行的方法
     *
     * @param delay 延时
     */
    public void run(int delay) {
        if (dismissVoteMate.voteTime != 0) {    //有进行中的投票
            if (System.currentTimeMillis() - dismissVoteMate.voteTime > voteTimeout) {
                //超过5分钟，重置解散状态
                dismissVoteMate.reset();
            }
        }
    }

    /**
     * 解散投票
     *
     * @param hero hero
     * @return B
     */
    public B dismissVote(Hero hero, boolean agree) {
        int chair = getChair(hero);
        if (chair == INVALID_CHAIR) {
            return B.b(false, "无权限");
        }
        if (!tableAbility.isStart()) {
            if (hero.getUserId().equals(owner.getUserId())) {
                return B.b(true, "解散房间");
            } else {
                return leave(hero); //游戏尚未开始，非owner的解散转成离开事件
            }
        }
        dismissVoteMate.vote(chair, agree);    //投票
        int agreeCount = dismissVoteMate.count(true);               //同意的票数
        int refuseCount = dismissVoteMate.count(false);            //拒绝票数 //发送投票情况给客户端
        sendTableDismissVoteInfo(Table.INVALID_CHAIR);                   //发送投票信息
        if (agreeCount + refuseCount == heroesCount() ||
                tableAbility.checkAgreeDismiss(agreeCount, refuseCount) ||
                tableAbility.checkRefuseDismiss(agreeCount, refuseCount)
        ) {    //都已经投票或者可以解散，重置投票信息
            dismissVoteMate.reset();
            sendTableDismissVoteInfo(Table.INVALID_CHAIR);          //发送投票信息
        }
        if (tableAbility.checkAgreeDismiss(agreeCount, refuseCount)) {   //校验解散
            tableAbility.end(EndReason.VOTE_DISMISS);
        }
        return B.b(true);
    }

    /**
     * 加入
     *
     * @param hero hero
     * @return true 加入成功/false 加入失败
     */
    public synchronized B enter(Hero hero) {
        int currChair = checkChair(hero);
        if (currChair != INVALID_CHAIR) {  //判断是否已经在该桌子、通常在掉线重接后触发
            if (heroes.get(currChair).heroStatus.netStatus != HeroNetStatus.ONLINE) {   //状态是在线状态则不处理
                successJoinTable(hero, currChair);
                changeStatus(currChair, hero, HeroNetStatus.ONLINE);
            }
            return B.b(true, this);
        }
        Table currTable = checkTable(hero); //判断是否在其他桌子
        if (currTable != null) {
            return B.b(false, MessageFormat.format("您已经在{0}桌子,无法加入其他桌子", currTable.getTableNo()));
        }
        if (heroes.size() >= maxChair) {
            return B.b(false, "当前桌子人满为患,无法加入");
        }
        if (tableAbility.isStart()) {
            return B.b(false, "桌子已经被锁定,无法加入");
        }
        B b = tableAbility.beforeEnter(hero);
        if (b.b) {
            for (int chair = 0; chair < maxChair; chair++) {
                if (!heroes.containsKey(chair)) {
                    heroes.put(chair, new HeroMate(hero, new HeroStatus(HeroChairStatus.STAND_UP, HeroNetStatus.ONLINE), false));
                    successJoinTable(hero, chair);
                    changeStatus(chair, hero, HeroChairStatus.STAND_UP, HeroNetStatus.ONLINE);
                    tableAbility.afterEnter(chair, hero);
                    return B.b(true, this);
                }
            }
            return B.b(false, "没有分配到椅子");
        }
        return b;
    }

    /**
     * 成功加入桌子
     *
     * @param hero      hero
     * @param currChair currChair
     */
    private void successJoinTable(Hero hero, int currChair) {
        hero.setTableNo(tableNo);
        sendJoin(hero, currChair);
        HeroEnterEventResponse response = ResponseFactory.success(HeroEnterEventResponse.class, "成功加入");
        response.setChair(currChair);
        response.setShowId(hero.getShowId());
        response.setUserId(hero.getUserId());
        response.setNickName(hero.getNickName());
        sendTable(response);

    }

    /**
     * 发送加入的报文
     *
     * @param hero  hero
     * @param chair chair
     */
    private void sendJoin(Hero hero, int chair) {
        String ruleText = this.getRule().toJson();
        Hero owner = this.getOwner();
        JoinTableEventResponse response = ResponseFactory.success(JoinTableEventResponse.class, "加入桌子");
        response.setOwnerId(owner.getUserId());
        response.setShowId(owner.getShowId());
        response.setUserId(hero.getUserId());
        response.setRuleText(ruleText);
        response.setTableNo(tableNo);
        response.setChair(chair);
        sendChairs(response, chair);
    }

    /**
     * 发送桌子场景信息给指定椅子
     * 在玩家进入桌子后触发
     *
     * @param chair 椅子
     */
    private void sendTableScene(int chair) {
        //发送玩家信息
        HeroSceneResponse heroSceneResponse = ResponseFactory.success(HeroSceneResponse.class, "桌子玩家信息");
        List<HeroSceneResponse.HeroItem> heroItems = new ArrayList<>();
        for (Map.Entry<Integer, HeroMate> entry : heroes.entrySet()) {
            HeroSceneResponse.HeroItem heroItem = new HeroSceneResponse.HeroItem();
            heroItem.setChair(entry.getKey());
            heroItem.setShowId(entry.getValue().hero.getShowId());
            heroItem.setUserId(entry.getValue().hero.getUserId());
            heroItem.setNickName(entry.getValue().hero.getNickName());
            heroItem.setOnline(entry.getValue().heroStatus.netStatus == HeroNetStatus.ONLINE);
            heroItem.setSitDown(entry.getValue().heroStatus.chairStatus == HeroChairStatus.SIT_DOWN);
            heroItems.add(heroItem);
        }
        heroSceneResponse.setHeroes(heroItems);
        //发送玩家场景信息给指定
        sendChairs(heroSceneResponse, chair);
        //发送当前游戏场景信息给指定的椅子
        tableAbility.currentGameScene(chair);
    }

    /**
     * 发送给桌子全部的玩家
     *
     * @param response 响应
     */
    public void sendTable(Response response) {
        for (HeroMate heroMate : heroes.values()) {
            Tio.sendToUser(AppConfig.use().getTioConfig(), heroMate.hero.getUserId(), WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
        }
    }

    /**
     * 发送给指定椅子
     *
     * @param response response
     * @param chairs   chairs
     */
    public void sendChairs(Response response, int... chairs) {
        if (chairs.length == 1 && chairs[0] == Table.INVALID_CHAIR) {
            sendTable(response);
            return;
        }
        for (int chair : chairs) {
            HeroMate heroMate = heroes.get(chair);
            if (heroMate != null) {
                Tio.sendToUser(AppConfig.use().getTioConfig(), heroMate.hero.getUserId(), WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
            }
        }
    }

    /**
     * 发送给指定玩家
     *
     * @param response response
     * @param heroes   heroes
     */
    public void sendHeroes(Response response, Hero... heroes) {
        for (Hero hero : heroes) {
            Tio.sendToUser(AppConfig.use().getTioConfig(), hero.getUserId(), WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
        }
    }

    /**
     * 除了之外
     *
     * @param response response
     * @param chairs   chairs
     */
    public void sendExceptChairs(Response response, int... chairs) {
        for (Map.Entry<Integer, HeroMate> entry : heroes.entrySet()) {
            boolean contain = false;
            for (int chair : chairs) {
                if (chair == entry.getKey()) {
                    contain = true;
                    break;
                }
            }
            if (!contain) {
                Tio.sendToUser(AppConfig.use().getTioConfig(), entry.getValue().hero.getUserId(), WsResponse.fromText(response.toJson(), AppConfig.use().getCharset()));
            }
        }

    }

    /**
     * 改变状态
     *
     * @param chair         chair
     * @param hero          hero
     * @param heroNetStatus heroNetStatus
     */
    public void changeStatus(int chair, Hero hero, HeroNetStatus heroNetStatus) {
        HeroStatus heroStatus = heroes.get(chair).heroStatus;
        heroStatus.netStatus = heroNetStatus;
        switch (heroNetStatus) {
            case OFFLINE:
                HeroOfflineEventResponse offlineResponse = ResponseFactory.success(HeroOfflineEventResponse.class, "玩家掉线");
                offlineResponse.setChair(chair);
                offlineResponse.setShowId(hero.getShowId());
                offlineResponse.setUserId(hero.getUserId());
                offlineResponse.setUserName(hero.getUserName());
                sendTable(offlineResponse);
                tableAbility.offline(chair, hero);
                break;
            case ONLINE:
                HeroOnlineEventResponse onlineResponse = ResponseFactory.success(HeroOnlineEventResponse.class, "玩家上线");
                onlineResponse.setChair(chair);
                onlineResponse.setShowId(hero.getShowId());
                onlineResponse.setUserId(hero.getUserId());
                onlineResponse.setUserName(hero.getUserName());
                sendTable(onlineResponse);
                tableAbility.online(chair, hero);
                break;
        }
    }

    /**
     * 改变状态
     *
     * @param chair           chair
     * @param hero            hero
     * @param heroChairStatus heroChairStatus
     */
    public void changeStatus(int chair, Hero hero, HeroChairStatus heroChairStatus) {
        HeroStatus heroStatus = heroes.get(chair).heroStatus;
        heroStatus.chairStatus = heroChairStatus;
        switch (heroChairStatus) {
            case SIT_DOWN:
                HeroSitDownEventResponse sitDownResponse = ResponseFactory.success(HeroSitDownEventResponse.class, "玩家坐下");
                sitDownResponse.setChair(chair);
                sitDownResponse.setShowId(hero.getShowId());
                sitDownResponse.setUserId(hero.getUserId());
                sitDownResponse.setUserName(hero.getUserName());
                sendTable(sitDownResponse);
                tableAbility.sitDown(chair, hero);
                break;
            case STAND_UP:
                HeroStandUpEventResponse standUpResponse = ResponseFactory.success(HeroStandUpEventResponse.class, "玩家起立");
                standUpResponse.setChair(chair);
                standUpResponse.setShowId(hero.getShowId());
                standUpResponse.setUserId(hero.getUserId());
                standUpResponse.setUserName(hero.getUserName());
                sendTable(standUpResponse);
                tableAbility.standUp(chair, hero);
                break;
        }
    }

    /**
     * 改变状态
     *
     * @param chair           chair
     * @param hero            hero
     * @param heroChairStatus heroChairStatus
     * @param heroNetStatus   heroNetStatus
     */
    public void changeStatus(int chair, Hero hero, HeroChairStatus heroChairStatus, HeroNetStatus heroNetStatus) {
        changeStatus(chair, hero, heroNetStatus);
        changeStatus(chair, hero, heroChairStatus);
    }

    /**
     * 是否已经在该桌子
     *
     * @param hero hero
     * @return boolean
     */
    private int checkChair(Hero hero) {
        for (int chair = 0; chair < maxChair; chair++) {
            HeroMate currHeroMate = heroes.get(chair);
            if (currHeroMate != null && currHeroMate.hero.getUserId().equals(hero.getUserId())) {
                return chair;
            }
        }
        return INVALID_CHAIR;
    }

    /**
     * 获取玩家椅子
     *
     * @param hero hero
     * @return chair
     */
    public int getChair(Hero hero) {
        return checkChair(hero);
    }

    /**
     * 检验是否已经加入其他桌子
     *
     * @param hero hero
     * @return Table
     */
    private Table checkTable(Hero hero) {
        List<Table> tables = TableManager.getInstance().getTables();
        for (Table table : tables) {
            if (table.checkChair(hero) != INVALID_CHAIR && table != this) {
                return table;
            }
        }
        return null;
    }

    /**
     * 清除资源
     */
    void destroy() {
        LOGGER.info("桌子结束，编号为{}，owner为{}", getTableNo(), owner.getUserId());
        for (HeroMate heroMate : heroes.values()) {     //清除玩家数据
            heroMate.hero.setTableNo(Table.INVALID_TABLE);
        }
        TableManager.getInstance().remove(this);
    }

    /**
     * 离开
     *
     * @param hero hero
     * @return true 离开成功/false 离开失败
     */
    public synchronized B leave(Hero hero) {
        int chair = checkChair(hero);
        if (chair != INVALID_CHAIR) {
            if (tableAbility.isStart()) {
                return B.b(false, "游戏已经开始，无法离开");
            }
            B b = tableAbility.beforeLeave(chair, hero);
            if (b.b) {
                changeStatus(chair, hero, HeroChairStatus.STAND_UP);
                heroes.remove(chair);
                hero.setTableNo(INVALID_TABLE);
                HeroLeaveEventResponse response = ResponseFactory.success(HeroLeaveEventResponse.class, "玩家离开");
                response.setChair(chair);
                response.setShowId(hero.getShowId());
                response.setUserId(hero.getUserId());
                response.setUserName(hero.getUserName());
                sendTable(response);
                sendHeroes(response, hero);
                tableAbility.afterLeave(chair, hero);
            }
            return b;
        }
        return B.b(false, "玩家不再此桌子,离开失败");
    }

    /**
     * 坐下
     *
     * @param hero  玩家
     * @param chair 椅子
     * @return b
     */
    public B sitDown(Hero hero, int chair) {
        if (tableAbility.isGameStart()) {
            return B.b(false, "游戏已经开始，无法坐下!");
        }
        HeroStatus heroStatus = heroes.get(chair).heroStatus;
        if (heroStatus == null) {
            return B.b(false, "玩家状态异常!");
        }
        changeStatus(chair, hero, HeroChairStatus.SIT_DOWN);
        B b = tableAbility.checkStart();
        LOGGER.info("游戏开始判断:{}", b.m);
        return B.b(true, "成功坐下!");
    }

    /**
     * 起立
     *
     * @param hero  玩家
     * @param chair 椅子
     * @return b
     */
    public B standUp(Hero hero, int chair) {
        if (tableAbility.isGameStart()) {
            return B.b(false, "游戏已经开始，无法起立!");
        }
        HeroStatus heroStatus = heroes.get(chair).heroStatus;
        if (heroStatus == null) {
            return B.b(false, "玩家状态异常!");
        }
        changeStatus(chair, hero, HeroChairStatus.STAND_UP);
        return B.b(true, "成功起立!");
    }

    /**
     * 坐下
     *
     * @param hero  玩家
     * @param chair 椅子
     * @return b
     */
    public B offline(Hero hero, int chair) {
        HeroStatus heroStatus = heroes.get(chair).heroStatus;
        if (heroStatus == null) {
            return B.b(false, "玩家状态异常!");
        }
        changeStatus(chair, hero, HeroNetStatus.OFFLINE);
        return B.b(true, "玩家离线!");
    }

    /**
     * 客户端准备好了
     *
     * @param hero hero
     */
    public void clientReady(Hero hero, int chair) {
        sendTableScene(chair);                  //发送桌子场景信息
        if (tableAbility.isStart()) {
            sendTableDismissVoteInfo(chair);    //游戏如果开始才会有投票
        }
        heroes.get(chair).clientReady = true;
        B b = tableAbility.checkStart();
        LOGGER.info("游戏开始判断:{}", b.m);
    }

    /**
     * 发送投票信息
     *
     * @param chair chair
     */
    private void sendTableDismissVoteInfo(int chair) {
        DismissVoteEventResponse dismissVoteEventResponse = ResponseFactory.success(DismissVoteEventResponse.class, "解散投票");
        dismissVoteEventResponse.setStatus(dismissVoteMate.dismissStatus.value);
        dismissVoteEventResponse.setCountDown((voteTimeout - (int) (System.currentTimeMillis() - dismissVoteMate.voteTime)) / 1000);
        dismissVoteEventResponse.setVoteTime(new DateTime(dismissVoteMate.voteTime).toString("yyyy-MM-dd HH:mm:ss"));
        dismissVoteEventResponse.setAgrees(dismissVoteMate.agrees());
        dismissVoteEventResponse.setRefuses(dismissVoteMate.refuses());
        sendChairs(dismissVoteEventResponse, chair);
    }

    /**
     * 获取玩家
     *
     * @param chair chair
     * @return Hero
     */
    public Hero getHero(int chair) {
        return heroes.get(chair).hero;
    }

    /**
     * 获取桌子坐下的总玩家数量
     *
     * @return 坐下的总人数
     */
    public int sitDownCount() {
        int i = 0;
        for (int chair = 0; chair < maxChair; chair++) {
            HeroStatus heroStatus = heroes.get(chair).heroStatus;
            if (heroStatus != null && heroStatus.chairStatus == HeroChairStatus.SIT_DOWN) {
                i++;
            }
        }
        return i;
    }

    /**
     * 获取起立的总人数
     *
     * @return 起立的总人数
     */
    public int standUpCount() {
        int i = 0;
        for (int chair = 0; chair < maxChair; chair++) {
            HeroStatus heroStatus = heroes.get(chair).heroStatus;
            if (heroStatus != null && heroStatus.chairStatus == HeroChairStatus.STAND_UP) {
                i++;
            }
        }
        return i;
    }

    /**
     * 客户端准备好的人数
     *
     * @return count
     */
    public int clientReadyHeroesCount() {
        int i = 0;
        for (int chair = 0; chair < maxChair; chair++) {
            HeroMate heroMate = heroes.get(chair);
            if (heroMate != null && heroMate.clientReady) {
                i++;
            }
        }
        return i;
    }

    /**
     * 玩家总数
     *
     * @return count
     */
    public int heroesCount() {
        return heroes.values().size();
    }

    /**
     * 获取在线的总人数
     *
     * @return 在线总人数
     */
    public int onlineCount() {
        int i = 0;
        for (int chair = 0; chair < maxChair; chair++) {
            HeroStatus heroStatus = heroes.get(chair).heroStatus;
            if (heroStatus != null && heroStatus.netStatus == HeroNetStatus.ONLINE) {
                i++;
            }
        }
        return i;
    }

    /**
     * 获取离线总人数
     *
     * @return 离线总人数
     */
    public int offlineCount() {
        int i = 0;
        for (int chair = 0; chair < maxChair; chair++) {
            HeroStatus heroStatus = heroes.get(chair).heroStatus;
            if (heroStatus != null && heroStatus.netStatus == HeroNetStatus.OFFLINE) {
                i++;
            }
        }
        return i;
    }

    public TableAbility getTableAbility() {
        return this.tableAbility;
    }

    public Rule getRule() {
        return rule;
    }

    public int getTableNo() {
        return tableNo;
    }

    public Hero getOwner() {
        return owner;
    }

    public Map<Integer, HeroMate> getHeroes() {
        return heroes;
    }

}
