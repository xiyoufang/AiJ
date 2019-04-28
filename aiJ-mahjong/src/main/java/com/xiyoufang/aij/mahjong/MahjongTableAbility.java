package com.xiyoufang.aij.mahjong;

import com.google.common.primitives.Bytes;
import com.google.common.primitives.Ints;
import com.xiyoufang.aij.core.ResponseFactory;
import com.xiyoufang.aij.mahjong.event.OperateEvent;
import com.xiyoufang.aij.mahjong.event.OutCardEvent;
import com.xiyoufang.aij.mahjong.record.*;
import com.xiyoufang.aij.mahjong.response.*;
import com.xiyoufang.aij.mahjong.struct.*;
import com.xiyoufang.aij.room.hero.Hero;
import com.xiyoufang.aij.room.table.EndMessage;
import com.xiyoufang.aij.room.table.Rule;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbilityAdapter;
import com.xiyoufang.aij.utils.Json;
import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class MahjongTableAbility extends TableAbilityAdapter {
    /**
     * 无效牌
     */
    public static final byte INVALID_CARD = -1;
    /**
     * 最大人数
     */
    private final static int MAX_CHAIR = 4;
    /**
     * 库存麻将
     */
    private byte[] repertoryCard;
    /**
     * 玩家手牌转成Index
     */
    private byte[][] cardIndices;
    /**
     * 剩余数量
     */
    private int leftCardCount;
    /**
     * 庄家
     */
    private int banker = Table.INVALID_CHAIR;
    /**
     * 当前发的牌
     */
    private byte currCard;
    /**
     * 发牌数
     */
    private int dispatchCardNumber;
    /**
     * 当前椅子
     */
    private int currChair;
    /**
     * 出牌的椅子
     */
    private int outCardChair;
    /**
     * 出牌总数
     */
    private int[] discardCount;
    /**
     * 出牌的记录
     */
    private byte[][] discardCards;
    /**
     * 存放碰、杠、吃的牌
     */
    private Map<Integer, List<WeaveItem>> heroWeaveItems;
    /**
     * 存放胡牌结果
     */
    private Map<Integer, H> hHeroes;
    /**
     * 总局数
     */
    private int gameNumber = 8;
    /**
     * Action
     */
    private int[] action;
    /**
     * 选择的动作
     */
    private int[] performAction;
    /**
     * 响应
     */
    private boolean[] response;
    /**
     * 筛子点数
     */
    int diceSum = 0;
    /**
     * 还原椅子（用来处理玩家操作 点击 过，用来恢复）
     */
    private int resumeChair;
    /**
     * 抢杠状态
     */
    private boolean grabG;
    /**
     * 杠开标识
     */
    private boolean gOpen;
    /**
     * 逻辑
     */
    private MahjongLogic mahjongLogic = new MahjongLogic();
    /**
     * 游戏状态
     */
    private MahjongGameStatus gameStatus = MahjongGameStatus.GAME_PREPARE;
    /**
     * 动作对应的牌
     */
    private byte[] actionCard;
    /**
     * 动作对应的牌
     */
    private byte[][] actionCards;
    /**
     * 杠分
     */
    private static final int G_SCORE = 0;
    /**
     * 胡分
     */
    private static final int H_SCORE = 1;
    /**
     * 麻将游戏记录
     */
    private MahjongRecord mahjongRecord = new MahjongRecord();
    /**
     * 当前局游戏记录
     */
    private MahjongGameRecord mahjongGameRecord;

    /**
     * 发送当前游戏场景
     *
     * @param chair chair
     */
    @Override
    public void currentGameScene(int chair) { //发送当前场景
        GameStatusResponse gameStatusResponse = ResponseFactory.success(GameStatusResponse.class, "游戏状态");
        gameStatusResponse.setStatus(gameStatus.getValue());
        sendChairs(gameStatusResponse, chair);
        switch (gameStatus) {
            case GAME_PREPARE:
                sendChairs(ResponseFactory.success(PrepareGameSceneResponse.class, "游戏预备"), chair);
                break;
            case GAME_PLAYING:
                PlayingGameSceneResponse playingGameSceneResponse = ResponseFactory.success(PlayingGameSceneResponse.class, "游戏场景");
                playingGameSceneResponse.setChairCount(chairCount);
                playingGameSceneResponse.setChair(chair);
                playingGameSceneResponse.setBanker(banker);
                playingGameSceneResponse.setCurrent(currChair);
                playingGameSceneResponse.setDiceSum(diceSum);
                playingGameSceneResponse.setLeftCardCount(leftCardCount);
                playingGameSceneResponse.setTotalNumber(gameNumber);
                playingGameSceneResponse.setCurrentNumber(currGameNumber);
                playingGameSceneResponse.setCurrCard(currCard);
                playingGameSceneResponse.setAction(action[chair]);
                playingGameSceneResponse.setActionCard(actionCard[chair]);
                playingGameSceneResponse.setActionCards(actionCards[chair]);
                playingGameSceneResponse.setCards(MahjongKit.switchIndicesToCards(cardIndices[chair]));
                playingGameSceneResponse.setDiscardCount(discardCount);
                playingGameSceneResponse.setDiscardCards(discardCards);
                playingGameSceneResponse.setWeaveItems(getWeaveItemResponses());
                playingGameSceneResponse.setScores(readScores());
                sendChairs(playingGameSceneResponse, chair);
                break;
        }
    }

    /**
     * 获取组合
     *
     * @return WeaveItemResponse
     */
    private WeaveItemResponse[][] getWeaveItemResponses() {
        WeaveItemResponse[][] weaveItems = new WeaveItemResponse[chairCount][];
        for (int i = 0; i < chairCount; i++) {
            List<WeaveItem> items = getWeaveItems(i);
            weaveItems[i] = new WeaveItemResponse[items.size()];
            for (int ii = 0; ii < items.size(); ii++) {
                WeaveItem weaveItem = items.get(ii);
                WeaveItemResponse weaveItemResponse = new WeaveItemResponse();
                weaveItemResponse.setCenterCard(weaveItem.getCenterCard());
                weaveItemResponse.setOpen(weaveItem.isOpen());
                weaveItemResponse.setProvider(weaveItem.getProvider());
                weaveItemResponse.setWeaveType(weaveItem.getWeaveType().getValue());
                weaveItems[i][ii] = weaveItemResponse;
            }
        }
        return weaveItems;
    }

    /**
     * 桌子开始
     *
     * @param rule 规则
     */
    @Override
    public void onInit(Rule rule) {
        LOGGER.info("创建桌子成功,规则为{}", rule.toJson()); //在onCreate方法里初始化全局变量，例如规则，局数
        gameNumber = 4;
    }

    /**
     * 桌子开始事件
     */
    @Override
    protected void onStart() {
        mahjongRecord.setTableNo(tableNo);                  //桌子编号
        for (int i = 0; i < chairCount; i++) {              //设置游戏记录的玩家信息，初始化统计信息
            MahjongPlayerRecord mahjongPlayerRecord = new MahjongPlayerRecord();
            Hero hero = this.table.getHero(i);
            mahjongPlayerRecord.setAvatar(hero.getAvatar());
            mahjongPlayerRecord.setUserId(hero.getUserId());
            mahjongPlayerRecord.setUserName(hero.getUserName());
            mahjongPlayerRecord.setNickName(hero.getNickName());
            mahjongPlayerRecord.setGender(hero.getGender());
            mahjongPlayerRecord.setAddress(hero.getAddress());
            mahjongPlayerRecord.setLatitude(hero.getLatitude());
            mahjongPlayerRecord.setLongitude(hero.getLongitude());
            mahjongPlayerRecord.setIp(hero.getIp());
            mahjongRecord.getMahjongPlayerRecords().add(mahjongPlayerRecord);
        }
    }

    /**
     * 开始重置桌子
     */
    @Override
    public void onGameReset() {
        repertoryCard = MahjongKit.shuffle(MahjongConst.CARDS, 2);
        /*
        MahjongKit.specifyShuffle(new byte[]{
                1,
                1, 8, 9, 19, 23, 33, 34, 37, 40, 40, 41, 50, 50,
                1, 3, 6, 9, 18, 20, 21, 23, 24, 33, 37, 38, 50,
                4, 6, 17, 21, 25, 25, 34, 35, 35, 37, 38, 39, 40,
                2, 3, 3, 4, 5, 5, 6, 7, 24, 24, 49, 51, 52
        });*///MahjongKit.shuffle(MahjongConst.CARDS, 4); //洗牌
        leftCardCount = repertoryCard.length;
        cardIndices = new byte[chairCount][];
        currCard = INVALID_CARD;
        currChair = Table.INVALID_CHAIR;
        outCardChair = Table.INVALID_CHAIR;
        resumeChair = Table.INVALID_CHAIR;
        dispatchCardNumber = 0;
        diceSum = 0;
        discardCount = new int[chairCount];
        discardCards = new byte[chairCount][MahjongConst.CARDS.length];
        heroWeaveItems = new ConcurrentHashMap<Integer, List<WeaveItem>>();
        hHeroes = new ConcurrentHashMap<>();
        action = new int[chairCount];
        performAction = new int[chairCount];
        response = new boolean[chairCount];
        actionCard = new byte[chairCount];
        actionCards = new byte[chairCount][];
        Arrays.fill(actionCards, new byte[]{});
        grabG = false;
        gOpen = false;
        //游戏记录
        mahjongGameRecord = new MahjongGameRecord();
        mahjongGameRecord.setRepertory(repertoryCard);
        mahjongRecord.getMahjongGameRecords().add(mahjongGameRecord);
    }

    /**
     * 游戏开始
     */
    @Override
    public void onGameStart() {
        LOGGER.info("开始游戏，当前为第{}局，总计{}局", currGameNumber, gameNumber);
        gameStatus = MahjongGameStatus.GAME_PLAYING;
        diceSum = MahjongKit.diceSum(2);
        if (banker == Table.INVALID_CHAIR) {    //丢筛子确定庄家
            int i = diceSum % chairCount;
            banker = i == 0 ? (chairCount - 1) : i - 1;
        }
        for (int i = 0; i < chairCount; i++) {
            leftCardCount -= (MahjongConst.MAX_COUNT - 1);
            byte[] cards = new byte[MahjongConst.MAX_COUNT - 1];
            System.arraycopy(repertoryCard, leftCardCount, cards, 0, MahjongConst.MAX_COUNT - 1);
            cardIndices[i] = MahjongKit.switchCardsToIndices(cards); //每人发 13 张牌，将card转成index模式
        }
        for (int i = 0; i < chairCount; i++) {//封装命令，将牌信息发送给用户
            GameStartEventResponse response = ResponseFactory.success(GameStartEventResponse.class, "游戏开始");
            response.setChairCount(chairCount);
            response.setChair(i);
            response.setDiceSum(diceSum);
            response.setBanker(banker);
            response.setCurrent(banker);
            response.setLeftCardCount(leftCardCount);
            response.setCards(MahjongKit.switchIndicesToCards(cardIndices[i]));
            response.setTotalNumber(gameNumber);
            response.setCurrentNumber(currGameNumber);
            response.setScores(readScores());
            sendChairs(response, i);
            MahjongGameStartRecord mahjongGameStartRecord = new MahjongGameStartRecord();
            mahjongGameStartRecord.setCards(response.getCards());
            mahjongGameRecord.getMahjongGameStartRecord().add(mahjongGameStartRecord);
        }
        mahjongGameRecord.setBanker(banker);
        printLog();
        dispatchCard(banker, false); //给庄家发牌
    }

    /**
     * 获取 weaveItems
     *
     * @param chair chair
     * @return WeaveItems
     */
    private List<WeaveItem> getWeaveItems(int chair) {
        if (!heroWeaveItems.containsKey(chair)) {
            heroWeaveItems.put(chair, new ArrayList<WeaveItem>());
        }
        return heroWeaveItems.get(chair);
    }

    /**
     * 发牌
     *
     * @param chair 椅子
     * @param tail  是否杠拿牌
     */
    private void dispatchCard(int chair, boolean tail) {
        if (leftCardCount > 0) {   //结束游戏
            gOpen = tail;
            currChair = chair;
            dispatchCardNumber++;
            currCard = repertoryCard[--leftCardCount];       //发的牌
            resetCycleActionVar();
            byte index = MahjongKit.switchCardToIndex(currCard);
            cardIndices[currChair][index] += 1;
            DispatchCardEventResponse response = ResponseFactory.success(DispatchCardEventResponse.class, "发牌");
            response.setCard(currCard);
            response.setChair(chair);
            response.setTail(tail);
            sendChairs(response, chair);    //自己显示、其他隐藏
            response.setCard(INVALID_CARD);
            sendExceptChairs(response, chair);
            addMahjongGameActionRecord(MahjongAction.DISPATCH, chair, chair, currCard, new byte[]{}, 0);
            //校验杠和校验胡牌
            G g = mahjongLogic.estimateG(cardIndices[chair], currCard, getWeaveItems(chair), true, chair);
            H h = mahjongLogic.estimateH(cardIndices[chair], currCard, getWeaveItems(chair), true, chair, Source.IN, dispatchCardNumber);
            sendOperateNotify(chair, null, g, h, currCard, chair);
        } else {
            gameEnd();
        }
    }

    /**
     * 重置操作相关变量
     */
    private void resetCycleActionVar() {
        Arrays.fill(action, 0);
        Arrays.fill(performAction, 0);
        Arrays.fill(response, false);
        Arrays.fill(actionCard, (byte) 0);
        Arrays.fill(actionCards, new byte[]{});
    }

    /**
     * @param chair    当前
     * @param p        碰
     * @param g        杠
     * @param h        胡
     * @param card     牌
     * @param provider 供应者
     */
    private boolean sendOperateNotify(int chair, P p, G g, H h, byte card, int provider) {
        if (p != null) action[chair] |= MahjongConst.P;   //有杠
        if (g != null) action[chair] |= MahjongConst.G;   //有杠
        if (h != null) action[chair] |= MahjongConst.H;  //有胡
        if (action[chair] != 0x00) {    //发送操作通知
            if (action[chair] != MahjongConst.N) {
                OperateNotifyEventResponse response = ResponseFactory.success(OperateNotifyEventResponse.class, "操作通知");
                response.setAction(action[chair]);
                response.setChair(chair);
                response.setProvider(provider);
                actionCard[chair] = card;
                if (p != null) response.setCard(card);
                if (h != null) response.setCard(card);
                if (g != null) {
                    byte[] cards = new byte[g.gs.size()];
                    boolean isNow = false;
                    for (int i = 0; i < g.gs.size(); i++) {
                        cards[i] = g.gs.get(0).card;
                        if (cards[i] == card) {
                            isNow = true;
                        }
                    }
                    response.setCards(cards);
                    response.setCard(isNow ? card : cards[0]); //杠,如果杠的牌不是当前的牌,者默认Card为第一张
                    actionCards[chair] = cards;
                }
                sendChairs(response, chair);
                addMahjongGameActionRecord(MahjongAction.NOTIFY, response.getChair(), response.getProvider(), response.getCard(), response.getCards(), response.getAction());
            }
            return true;
        }
        return false;
    }

    /**
     * 添加动作记录
     *
     * @param mahjongAction mahjongAction
     * @param chair         chair
     * @param provider      provider
     * @param card          card
     * @param cards         cards
     * @param action        action
     */
    private void addMahjongGameActionRecord(MahjongAction mahjongAction, int chair, int provider, byte card, byte[] cards, int action) {
        MahjongGameActionRecord mahjongGameActionRecord = new MahjongGameActionRecord();
        mahjongGameActionRecord.setMahjongAction(mahjongAction);    //动作类型
        mahjongGameActionRecord.setChair(chair);                    //椅子
        mahjongGameActionRecord.setProvider(provider);              //供应者
        mahjongGameActionRecord.setCard(card);                      //牌
        mahjongGameActionRecord.setCards(cards);                    //牌
        mahjongGameActionRecord.setAction(action);                  //操作
        mahjongGameRecord.getMahjongGameActionRecords().add(mahjongGameActionRecord);
        printLog();
    }

    /**
     * 玩家出牌事件
     *
     * @param chair 椅子
     * @param hero  玩家
     * @param event 事件
     */
    public synchronized void outCard(int chair, Hero hero, OutCardEvent event) {
        if (currChair != chair) {  //玩家校验
            sendChairs(ResponseFactory.error(ErrorEventResponse.class, "不允许出牌"), chair);
            return;
        }
        byte outCard = event.getCard();
        if (cardIndices[chair][MahjongKit.switchCardToIndex(outCard)] == 0) {
            sendChairs(ResponseFactory.error(ErrorEventResponse.class, "没有对应的牌"), chair);
            return;
        }
        if (MahjongKit.isValidCard(outCard)) {
            sendChairs(ResponseFactory.error(ErrorEventResponse.class, "异常出牌"), chair);
            return;
        }
        discardCards[chair][discardCount[chair]] = outCard;
        currCard = outCard;
        discardCount[chair] += 1;
        outCardChair = chair;
        resetCycleActionVar();
        MahjongKit.removeIndicesByCards(cardIndices[chair], outCard);
        OutCardEventResponse response = ResponseFactory.success(OutCardEventResponse.class, "出牌");
        response.setCard(outCard);
        response.setChair(chair);
        sendTable(response);
        addMahjongGameActionRecord(MahjongAction.OUT, chair, chair, outCard, new byte[]{}, 0);
        boolean hasAction = false;
        for (int i = 0; i < chairCount; i++) {
            action[i] = MahjongConst.N;
            if (i != chair) {    //排除自己
                P p = mahjongLogic.estimateP(cardIndices[i], outCard, i);
                G g = mahjongLogic.estimateG(cardIndices[i], outCard, getWeaveItems(i), false, i);
                H h = mahjongLogic.estimateH(cardIndices[i], outCard, getWeaveItems(i), false, chair, Source.OUT, dispatchCardNumber);
                hasAction |= sendOperateNotify(i, p, g, h, outCard, chair);
            }
        }
        if (!hasAction) {
            int nextChair = nextChair(chair);
            dispatchCard(nextChair, false);
        } else {
            resumeChair = nextChair(chair);
            currChair = Table.INVALID_CHAIR;
        }
    }

    /**
     * 操作，处理操作通知
     *
     * @param chair chair
     * @param hero  hero
     * @param event event
     */
    public void operate(int chair, Hero hero, OperateEvent event) {
        int chairAction = event.getAction();
        byte card = event.getCard();
        if (response[chair]) {
            sendChairs(ResponseFactory.error(ErrorEventResponse.class, "重复操作"), chair);
            return;
        }
        if (MahjongKit.isValidCard(card)
                || (actionCard[chair] != card
                && (actionCards[chair] != null && !Bytes.asList(actionCards[chair]).contains(card)))) {
            sendChairs(ResponseFactory.error(ErrorEventResponse.class, "无效的牌"), chair);
            return;
        }
        response[chair] = true;
        byte[] chairCardIndices = cardIndices[chair];
        List<WeaveItem> weaveItems = getWeaveItems(chair);
        OperateResultEventResponse eventResponse = ResponseFactory.success(OperateResultEventResponse.class);
        if (currChair == Table.INVALID_CHAIR) {
            int ac = action[chair];
            int targetAction = chairAction;
            List<Integer> targetChairs = new ArrayList<Integer>();
            targetChairs.add(chair);    //先添加自己
            int targetRank = MahjongKit.getActionRank(targetAction);
            performAction[chair] = targetAction;
            boolean wait = false;
            for (int i = 0; i < chairCount; i++) {
                if (i != chair) {
                    int userAction = (!response[i]) ? action[i] : performAction[i];
                    if (userAction == 0x00) {                                                   //过滤无动作
                        continue;
                    }
                    int userRank = MahjongKit.getActionRank(userAction);                         //获取自身动作优先级
                    if (targetRank < userRank) {
                        wait = true;
                        targetAction = userAction;
                    } else if (targetRank == userRank) {
                        wait = true;                                                             //一炮多响逻辑
                        targetChairs.add(i);
                    }
                }
            }
            if (wait) {
                for (int i = 0; i < chairCount; i++) {
                    if (action[i] != 0x00 && !response[i]) {
                        return;
                    }
                }
            }
            currChair = chair;
            currCard = INVALID_CARD;
            resetCycleActionVar();
            switch (targetAction) {
                case MahjongConst.N:  //过
                    eventResponse.setMessage("过");
                    eventResponse.setAction(MahjongConst.N);
                    eventResponse.setCard(card);
                    eventResponse.setChair(chair);
                    eventResponse.setProvider(outCardChair);
                    sendChairs(eventResponse, chair);
                    addMahjongGameActionRecord(MahjongAction.N, chair, outCardChair, card, new byte[]{}, MahjongConst.N);
                    dispatchCard(resumeChair, false);
                    break;
                case MahjongConst.P:  //碰
                    P p = mahjongLogic.estimateP(cardIndices[chair], card, outCardChair);
                    if (p != null) {
                        MahjongKit.removeIndicesByCards(cardIndices[chair], p.getCard(), p.getCard());//移除手上的牌
                        weaveItems.add(new WeaveItem(WeaveType.P, p.getCard(), true, outCardChair, true));
                        eventResponse.setMessage("碰");
                        eventResponse.setAction(MahjongConst.P);
                        eventResponse.setCard(card);
                        eventResponse.setChair(chair);
                        eventResponse.setProvider(outCardChair);
                        discardCount[outCardChair] = discardCount[outCardChair] - 1;
                        discardCards[outCardChair][discardCount[outCardChair]] = 0;
                        sendTable(eventResponse);
                        addMahjongGameActionRecord(MahjongAction.P, chair, outCardChair, card, new byte[]{}, MahjongConst.P);
                    }
                    break;
                case MahjongConst.G:  //杠
                    G g = mahjongLogic.estimateG(cardIndices[chair], card, weaveItems, false, outCardChair);
                    if (g != null) {
                        G._G destGang = getDestG(card, g);
                        if (destGang != null) {
                            MahjongKit.removeIndicesByCards(cardIndices[chair], destGang.card, destGang.card, destGang.card);//移除手上的牌
                            weaveItems.add(new WeaveItem(WeaveType.G, destGang.card, true, outCardChair, true));
                            discardCount[outCardChair] = discardCount[outCardChair] - 1;
                            discardCards[outCardChair][discardCount[outCardChair]] = 0;
                            sendGEvent(chair, outCardChair, card, eventResponse);
                            writeActionStatistic(chair, 0);  //0明杠
                            dispatchCard(chair, true);
                        }
                    }
                    break;
                case MahjongConst.H: //胡
                    if (grabG) { //抢杠
                        for (WeaveItem weaveItem : getWeaveItems(outCardChair)) {
                            if (weaveItem.getCenterCard() == card) {//杠设置为无效状态
                                weaveItem.setValid(false);
                            }
                        }
                    }
                    for (int targetChair : targetChairs) {
                        H h = mahjongLogic.estimateH(cardIndices[targetChair], card, weaveItems, false, outCardChair, grabG ? Source.GANG : Source.OUT, dispatchCardNumber);
                        if (h != null) {
                            sendHEvent(card, eventResponse, h, targetChair, outCardChair);
                            writeActionStatistic(targetChair, 2);  //2接炮胡
                        }
                    }
                    if (targetChairs.size() > 0) {
                        currCard = card;    //胡的那张牌
                        currChair = outCardChair;
                        gameEnd();   //游戏结束
                    }
                    break;
                default:
                    break;

            }
        } else if (currChair == chair) {  //自摸
            currCard = INVALID_CARD;
            resetCycleActionVar();
            switch (chairAction) {
                case MahjongConst.N:  //自摸过
                    eventResponse.setMessage("过");
                    eventResponse.setAction(MahjongConst.N);
                    eventResponse.setCard(card);
                    eventResponse.setChair(chair);
                    eventResponse.setProvider(chair);
                    sendChairs(eventResponse, chair);
                    addMahjongGameActionRecord(MahjongAction.N, chair, chair, card, new byte[]{}, MahjongConst.N);
                    break;
                case MahjongConst.P:  //碰
                    break;
                case MahjongConst.G:  //杠
                    G g = mahjongLogic.estimateG(cardIndices[chair], card, weaveItems, true, chair);
                    if (g != null) { //可以杠
                        boolean checked = false;
                        G._G destGang = getDestG(card, g);
                        if (destGang != null) {                                                //目标杠
                            switch (destGang.w) {
                                case G.A:                                       //暗杠
                                    weaveItems.add(new WeaveItem(WeaveType.G, destGang.card, false, chair, true));
                                    MahjongKit.removeIndicesByCards(cardIndices[chair], destGang.card, destGang.card, destGang.card, destGang.card);//移除手上的牌
                                    sendGEvent(chair, chair, card, eventResponse);
                                    dispatchCard(chair, true);
                                    writeActionStatistic(chair, 1);
                                    break;
                                case G.M:                                     //明杠
                                    //这种情况不存在明杠
                                    break;
                                case G.G:                                     //拐弯杠
                                    for (WeaveItem weaveItem : weaveItems) {
                                        if (weaveItem.getWeaveType() == WeaveType.P && weaveItem.getCenterCard() == card) {
                                            weaveItem.setWeaveType(WeaveType.G);
                                            weaveItem.setProvider(chair);//发送杠牌结果
                                            weaveItem.setOpen(true);
                                            weaveItem.setValid(true);
                                            canGrabGResponse(chair, card, eventResponse);
                                            writeActionStatistic(chair, 0);
                                        }
                                    }
                                    break;
                                case G.H:                              //后拐弯杠（可以抢杠）
                                    for (WeaveItem weaveItem : weaveItems) {
                                        if (weaveItem.getWeaveType() == WeaveType.P && weaveItem.getCenterCard() == card) {
                                            weaveItem.setWeaveType(WeaveType.G);
                                            weaveItem.setProvider(chair);
                                            weaveItem.setOpen(true);
                                            weaveItem.setValid(false);  //无效状态，不算分
                                            canGrabGResponse(chair, card, eventResponse);
                                            writeActionStatistic(chair, 0);
                                        }
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                    break;
                case MahjongConst.H:    //胡
                    H h = mahjongLogic.estimateH(cardIndices[chair], card, weaveItems, true, chair, gOpen ? Source.GANG : Source.IN, dispatchCardNumber);
                    if (h != null) {
                        sendHEvent(card, eventResponse, h, chair, chair);
                        writeActionStatistic(chair, 3);  //自摸
                        currCard = card;    //胡的那张牌
                        currChair = chair;
                        gameEnd();   //游戏结束
                    }
                    break;
                default:
                    break;

            }
        }
    }

    /**
     * 胡牌事件
     *
     * @param card          card
     * @param eventResponse eventResponse
     * @param h             胡信息
     * @param targetChair   胡牌人员
     * @param provider      供应人员
     */
    private void sendHEvent(byte card, OperateResultEventResponse eventResponse, H h, int targetChair, int provider) {
        eventResponse.setMessage("胡");
        eventResponse.setAction(MahjongConst.H);
        eventResponse.setCard(card);
        eventResponse.setChair(targetChair);
        eventResponse.setProvider(provider);
        sendTable(eventResponse);
        addMahjongGameActionRecord(MahjongAction.H, targetChair, provider, card, new byte[]{}, MahjongConst.H);
        hHeroes.put(targetChair, h);
    }

    /**
     * 获取目标杠
     *
     * @param card card
     * @param g    g
     * @return G._G
     */
    private G._G getDestG(byte card, G g) {
        G._G destGang = null;
        for (G._G _g : g.gs) {
            if (_g.card == card) {    //杠的列表里存在指定的牌
                destGang = _g;
            }
        }
        return destGang;
    }

    /**
     * 能被抢杠的杠响应
     *
     * @param chair         chair
     * @param card          card
     * @param eventResponse eventResponse
     */
    private void canGrabGResponse(int chair, byte card, OperateResultEventResponse eventResponse) {
        MahjongKit.removeIndicesByCards(cardIndices[chair], card);
        sendGEvent(chair, chair, card, eventResponse);
        grabG = grabG(chair, card);//抢杠判定
    }


    /**
     * 封装杠的响应
     *
     * @param chair         玩家
     * @param provider      供应者
     * @param card          牌
     * @param eventResponse eventResponse
     */
    private void sendGEvent(int chair, int provider, byte card, OperateResultEventResponse eventResponse) {
        eventResponse.setMessage("杠");
        eventResponse.setAction(MahjongConst.G);
        eventResponse.setCard(card);
        eventResponse.setChair(chair);
        eventResponse.setProvider(provider);
        sendTable(eventResponse);
        addMahjongGameActionRecord(MahjongAction.G, chair, provider, card, new byte[]{}, MahjongConst.G);
    }

    /**
     * 抢杠判定
     *
     * @param chair chair
     * @param card  card
     */
    private boolean grabG(int chair, byte card) {
        //检测是否抢杠
        boolean hasAction = false;
        for (int i = 0; i < chairCount; i++) {
            action[i] = 0x00;
            if (i != chair) {
                H h = mahjongLogic.estimateH(cardIndices[i], card, getWeaveItems(i), false, card, Source.GANG, dispatchCardNumber);
                hasAction |= sendOperateNotify(i, null, null, h, card, chair);
            }
        }
        resumeChair = chair;
        outCardChair = chair;
        if (!hasAction) {
            dispatchCard(resumeChair, true);
        } else {
            currChair = Table.INVALID_CHAIR;
        }
        return hasAction;
    }

    /**
     * 最大椅子数
     *
     * @return int
     */
    @Override
    public int getMaxChair() {
        return MAX_CHAIR;
    }

    /**
     * @return 是否已经准备好
     */
    @Override
    public boolean isReady() { //椅子的人数与最大
        return table.clientReadyHeroesCount() == MAX_CHAIR && table.sitDownCount() == MAX_CHAIR;
    }

    /**
     * 玩家加入之后
     *
     * @param chair chair 椅子位置
     * @param hero  hero 玩家
     */
    @Override
    public void afterEnter(int chair, Hero hero) {
        LOGGER.info("用户:{}已经进入桌子，椅子编号:{}", hero.getUserName(), chair);
    }

    /**
     * 离开加入之后
     *
     * @param chair chair 椅子位置
     * @param hero  hero 玩家
     */
    @Override
    public void afterLeave(int chair, Hero hero) {
        LOGGER.info("椅子编号:{}的用户:{}已经离开桌子，", chair, hero.getUserName());
    }

    /**
     * 坐下
     *
     * @param chair chair
     * @param hero  hero
     */
    @Override
    public void sitDown(int chair, Hero hero) {
    }

    /**
     * 起立
     *
     * @param chair chair
     * @param hero  hero
     */
    @Override
    public void standUp(int chair, Hero hero) {

    }

    /**
     * 游戏结束
     */
    @Override
    public void onGameEnd() {
        //开始处理积分，等逻辑
        LOGGER.info("本局胡牌玩家有{}人!", hHeroes.values().size());
        for (Map.Entry<Integer, H> hEntry : hHeroes.entrySet()) {
            LOGGER.info("椅子编号为:{}胡牌!", hEntry.getKey());
        }
        LOGGER.info("第{}局游戏结束，总计{}局!", currGameNumber, gameNumber);
        gameStatus = MahjongGameStatus.GAME_PREPARE;
        calculateGScore();
        calculateHScore();
        GameEndEventResponse response = ResponseFactory.success(GameEndEventResponse.class, "游戏结束");
        response.setBanker(banker);
        response.setChairCount(chairCount);
        response.setWeaveItems(getWeaveItemResponses());
        response.setProvider(currChair);
        byte[][] cards = new byte[chairCount][];
        String[] infos = new String[chairCount];
        int[] scores = new int[chairCount];
        int[] totalScores = new int[chairCount];
        for (int i = 0; i < chairCount; i++) {
            scores[i] = readScore(i, currGameNumber);
            totalScores[i] = readScore(i);
            cards[i] = MahjongKit.switchIndicesToCards(cardIndices[i]);
            if (i == currChair && hHeroes.containsKey(currChair)) {
                infos[i] = getHInfo(i);
            }
            if (i == currChair && !hHeroes.containsKey(currChair)) {
                infos[i] = "点炮";
            }
            if (i != currChair && hHeroes.containsKey(i)) {
                infos[i] = getHInfo(i);
            }
        }
        response.setScores(scores);
        response.setTotalScores(totalScores);
        response.setCards(cards);
        response.setCurrCard(currCard);
        response.setInfos(infos);
        response.setChairs(Ints.toArray(hHeroes.keySet()));
        sendTable(response);
        banker = newBanker();
        //记录分数
        mahjongGameRecord.setScores(scores);
        mahjongRecord.setTotalScores(totalScores);
        printLog();
    }

    /**
     * 判断结束
     *
     * @return boolean
     */
    @Override
    protected boolean checkEnd() {
        //结束调用end方式，不是直接调用onEnd,直接调用onEnd将无法释放table资源
        return currGameNumber >= gameNumber;
    }


    /**
     * 设置庄家
     */
    private int newBanker() {
        int banker = Table.INVALID_CHAIR;
        int min = chairCount;
        for (Integer chair : hHeroes.keySet()) {
            if (chair < banker) {
                chair = chair + chairCount;
            }
            if (Math.min(chair - currChair, min) == chair - currChair) {
                banker = chair;
            } else {
                min = chair - currChair;
            }
        }
        return banker;
    }

    /**
     * 胡牌的描述
     *
     * @param chair 椅子
     * @return string
     */
    private String getHInfo(int chair) {
        return hHeroes.get(chair).getInfo();
    }

    /**
     * 计算胡牌的分数
     */
    private void calculateHScore() {
        for (int i = 0; i < chairCount; i++) {
            if (hHeroes.containsKey(i)) {
                int maxMultiple = hHeroes.get(i).getMaxMultiple();  //最大番数
                if (currChair == i) { //自摸
                    writeScore(currGameNumber, H_SCORE, i, (chairCount - 1) * maxMultiple);
                    for (int ii = 0; ii < chairCount; ii++) {
                        if (ii != i) {
                            writeScore(currGameNumber, H_SCORE, ii, -maxMultiple);
                        }
                    }
                } else {    //点炮
                    writeScore(currGameNumber, H_SCORE, i, maxMultiple);
                    writeScore(currGameNumber, H_SCORE, currChair, -maxMultiple);
                }
            }
        }
    }

    /**
     * 计算杠的分数
     */
    private void calculateGScore() {
        for (int i = 0; i < chairCount; i++) {
            for (WeaveItem weaveItem : getWeaveItems(i)) {
                if (weaveItem.getWeaveType() == WeaveType.G) {
                    if (!weaveItem.isOpen()) { //暗杠
                        writeScore(currGameNumber, G_SCORE, i, (chairCount - 1) * 2);  //其他玩家每人2分
                        for (int ii = 0; ii < chairCount; ii++) {
                            if (ii != i) {
                                writeScore(currGameNumber, G_SCORE, ii, -2);           //其他玩家每人2分
                            }
                        }
                    } else {
                        //明杠
                        if (weaveItem.getProvider() != i) {
                            writeScore(currGameNumber, G_SCORE, i, (chairCount - 2));        //其他玩家1分
                            writeScore(currGameNumber, G_SCORE, i, 2);                 //点杠的玩家2分
                            for (int ii = 0; ii < chairCount; ii++) {
                                if (ii != i) {
                                    writeScore(currGameNumber, G_SCORE, ii, ii != weaveItem.getProvider() ? -1 : -2);
                                }
                            }
                        } else {//拐弯杠
                            if (weaveItem.isValid()) {  //每个玩家1分、后杠与被抢杠的无效
                                writeScore(currGameNumber, G_SCORE, i, (chairCount - 1));
                                for (int ii = 0; ii < chairCount; ii++) {
                                    if (ii != i) {
                                        writeScore(currGameNumber, G_SCORE, ii, -1);
                                    }
                                }
                            }
                        }
                    }
                }

            }
        }
    }

    /**
     * 桌子结束
     *
     * @param endReason endReason
     * @return detail
     */
    @Override
    public EndMessage onEnd(Table.EndReason endReason) {
        LOGGER.info("桌子游戏结束，释放将被全部资源，实际游戏{}局，总计{}局!", currGameNumber, gameNumber);
        switch (endReason) {
            case VOTE_DISMISS:        //投票解散
            case FORCE_DISMISS:       //强制解散
            case TIMEOUT:             //超时解散
                if (MahjongGameStatus.GAME_PLAYING == gameStatus) {
                    onGameEnd();          //强制调用onGameEnd
                }
                break;
            case NORMAL:
                break;
            default:
                break;
        }
        EndEventResponse endEventResponse = ResponseFactory.success(EndEventResponse.class, "结束");
        endEventResponse.setStartedTime(startedTime);
        endEventResponse.setEndedTime(new DateTime().toString("yyyy-MM-dd HH:mm:ss"));
        endEventResponse.setScore(readScores());
        endEventResponse.setTableNo(tableNo);
        endEventResponse.setActionStatistics(actionStatistics);
        sendTable(endEventResponse);
        printLog(); //输出日志
        return new EndMessage(Json.toJson(mahjongRecord), endReason);
    }

    /**
     * 输出日志，可用于宕机后恢复棋局
     */
    private void printLog() {
        printKeyLog(tableNo, Json.toJson(mahjongRecord));
    }

    /**
     * 读取玩家分数
     *
     * @return scores
     */
    private int[] readScores() {
        int[] scores = new int[chairCount];
        for (int i = 0; i < chairCount; i++) {
            int score = readScore(i);
            scores[i] = score;
        }
        return scores;
    }


}
