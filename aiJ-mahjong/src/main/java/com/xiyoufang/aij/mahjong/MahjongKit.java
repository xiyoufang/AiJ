package com.xiyoufang.aij.mahjong;

import com.google.common.primitives.Bytes;
import com.xiyoufang.aij.mahjong.struct.CardType;

import java.util.*;

/**
 * Created by 席有芳 on 2018/1/21.
 * 麻将工具类
 *
 * @author 席有芳
 */
public class MahjongKit {

    /**
     * 丢骰子
     *
     * @param num 数量
     * @return int[]
     */
    public static int[] throwDice(int num) {
        int[] t = new int[num];
        for (byte i = 0; i < num; i++) {
            t[i] = (1 + new Random().nextInt(6));
        }
        return t;
    }

    /**
     * 骰子点数
     *
     * @param num 数量
     * @return sum
     */
    public static int diceSum(int num) {
        int[] dices = throwDice(num);
        int sum = 0;
        for (int dice : dices) {
            sum += dice;
        }
        return sum;
    }


    /**
     * 洗牌
     *
     * @param cards cards
     * @param time  洗牌次数
     * @return byte[]
     */
    public static byte[] shuffle(byte[] cards, int time) {
        if (time > 0) {
            List<Byte> a = new ArrayList<Byte>();
            for (Byte card : cards) {
                a.add(card);
            }
            Collections.shuffle(a);
            Byte[] b = a.toArray(new Byte[cards.length]);
            for (int i = 0; i < b.length; i++) {
                cards[i] = b[i];
            }
            return shuffle(cards, --time);
        }
        return cards;
    }


    /**
     * 将牌转成索引形式
     *
     * @param cards cards
     * @return byte[]
     */
    public static byte[] switchCardsToIndices(byte... cards) {
        byte[] cardIndices = new byte[MahjongConst.MAX_INDEX];
        for (byte card : cards) {
            cardIndices[switchCardToIndex(card)]++;
        }
        return cardIndices;
    }

    /**
     * 将牌转成索引
     *
     * @param card card
     * @return index
     */
    public static byte switchCardToIndex(byte card) {
        return (byte) (((card & MahjongConst.MASK_COLOR) >> 4) * 9 + (card & MahjongConst.MASK_VALUE) - 1);
    }

    /**
     * 将牌的索引位置转成数据
     *
     * @param indices indices
     * @return cards
     */
    public static byte[] switchIndicesToCards(byte... indices) {
        byte[] cards = new byte[MahjongConst.MAX_COUNT];    //临时数据
        byte j = 0;
        for (byte i = 0; i < indices.length; i++) {
            byte count = indices[i];
            for (byte k = 0; k < count; j++, k++) {
                byte card = switchIndexToCard(i);   //牌数据
                cards[j] = card;
            }
        }
        return Arrays.copyOf(cards, j);
    }

    /**
     * 将位置转成数据
     *
     * @param index cardIndex
     * @return byte
     */
    public static byte switchIndexToCard(byte index) {
        return (byte) (((index / 9) << 4) | (index % 9 + 1));
    }

    /**
     * 移除手上的牌
     *
     * @param indices indices
     * @param cards   cards
     */
    public static void removeIndicesByCards(byte[] indices, byte... cards) {
        for (Byte card : cards) {
            indices[switchCardToIndex(card)]--;
        }
    }

    /**
     * 是否有效
     *
     * @param card card
     * @return bool
     */
    public static boolean isValidCard(byte card) {
        byte value = (byte) (card & MahjongConst.MASK_VALUE);
        byte color = (byte) ((card & MahjongConst.MASK_COLOR) >> 4);
        return ((value < 1 || value > 9 || color > 2) &&   //筒万条
                (value < 1 || value > 7 || color != 3));    //风
    }

    /**
     * 根据牌的索引获取牌的总数
     *
     * @param indices indices
     * @return int
     */
    public static int getCardNumber(byte... indices) {
        int number = 0;
        for (byte b : indices) {
            number += b;
        }
        return number;
    }

    /**
     * 获取某个范围内牌的总数量（双闭区间）
     *
     * @param indices indices
     * @param start   开始
     * @param end     截止
     * @return 总数
     */
    public static int getRangeCardNumber(byte[] indices, int start, int end) {
        int number = 0;
        for (int i = start; i <= end; i++) {
            number += indices[i];
        }
        return number;
    }

    /**
     * 根据牌的索引位置获取牌的类型
     *
     * @param index index
     * @return 牌类型
     */
    public static CardType getCardIndexType(byte index) {
        return getCardType(switchIndexToCard(index));
    }

    /**
     * 根据牌的值获取牌类型
     *
     * @param card card
     * @return 牌类型
     */
    public static CardType getCardType(byte card) {
        return CardType.getCardType((byte) ((card & MahjongConst.MASK_COLOR) >> 4));
    }

    /**
     * 值
     *
     * @param card card
     * @return value
     */
    public static byte getCardValue(byte card) {
        return (byte) (card & MahjongConst.MASK_VALUE);
    }

    /**
     * 牌名称
     *
     * @param card card
     * @return String
     */
    public static String getCardTitle(byte card) {
        switch (card) {
            case 0x31:
                return "東";
            case 0x32:
                return "南";
            case 0x33:
                return "西";
            case 0x34:
                return "北";
            case 0x35:
                return "中";
            case 0x36:
                return "發";
            case 0x37:
                return "白";
            default:
                return getCardValue(card) + getCardType(card).getName();
        }
    }

    /**
     * 动作优先级
     *
     * @param action action
     * @return int
     */
    public static int getActionRank(int action) {
        if ((action & MahjongConst.H) != 0) {
            return 3;
        }
        if ((action & MahjongConst.G) != 0) {
            return 2;
        }
        if ((action & MahjongConst.P) != 0) {
            return 1;
        }
        return 0;
    }

    /**
     * 指定混淆
     *
     * @param specifies 指定的牌
     * @return byte[]
     */
    public static byte[] specifyShuffle(byte[] specifies) {
        byte[] shuffle = MahjongKit.shuffle(MahjongConst.CARDS, 1);
        List<Byte> asList = new ArrayList<>(Bytes.asList(shuffle));
        List<Integer> indexOfs = new ArrayList<>();
        for (byte specify : specifies) {
            int indexOf = Bytes.indexOf(Bytes.toArray(asList), specify);
            asList.remove(indexOf);
        }
        for (byte specify : specifies) {
            asList.add(specify);
        }
        return Bytes.toArray(asList);
    }


    public static void main(String[] args) {
        MahjongKit.specifyShuffle(new byte[]{2, 3, 3, 4, 5, 5, 6, 7, 24, 24, 49, 51, 52});//MahjongKit.shuffle(MahjongConst.CARDS, 4); //洗牌
    }

}
