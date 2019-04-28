package com.xiyoufang.aij.mahjong;

import com.xiyoufang.aij.mahjong.rule.*;
import com.xiyoufang.aij.mahjong.struct.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-21.
 *
 * @author 席有芳
 */
public class MahjongLogic {

    private List<HRule> rules = new ArrayList<>();

    /**
     * 麻将逻辑
     */
    public MahjongLogic() {
        rules.add(new PingHRule());
        rules.add(new LanHRule());
        rules.add(new SevenPairHRule());
        rules.add(new SameColourHRule());
    }

    /**
     * 碰牌判定
     *
     * @param indices indices
     * @param card    card
     * @param chair   供应的椅子
     * @return 碰牌列表
     */
    public P estimateP(byte[] indices, byte card, int chair) {
        if (indices[MahjongKit.switchCardToIndex(card)] >= 2) {
            return new P(chair, card);
        }
        return null;
    }

    /**
     * 杠牌判定
     *
     * @param indices    indices
     * @param card       当前牌
     * @param weaveItems 组合
     * @param self       自己供应
     * @param chair      供应者
     * @return 存在杠的牌列表
     */
    public G estimateG(byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, int chair) {
        List<G._G> gs = new ArrayList<>();
        if (!self) {
            if (indices[MahjongKit.switchCardToIndex(card)] == 3) {//明杠
                return new G(Collections.singletonList(new G._G(G.M, chair, card)));
            }
        } else {
            for (byte i = 0; i < indices.length; i++) {
                if (indices[i] == 4) {  //暗杠
                    gs.add(new G._G(G.A, chair, MahjongKit.switchIndexToCard(i)));
                }
            }
            for (WeaveItem weaveItem : weaveItems) {
                if (weaveItem.getWeaveType() == WeaveType.P && weaveItem.getCenterCard() == card) {   //拐弯杠
                    gs.add(new G._G(G.G, chair, card));
                }
            }
            for (WeaveItem weaveItem : weaveItems) {
                if (weaveItem.getWeaveType() == WeaveType.P && weaveItem.getCenterCard() != card) {   //拐弯杠后杠
                    if (indices[MahjongKit.switchCardToIndex(weaveItem.getCenterCard())] == 1) {
                        gs.add(new G._G(G.H, chair, weaveItem.getCenterCard()));
                    }
                }
            }
        }
        if (gs.size() > 0) {
            return new G(gs);
        }
        return null;
    }

    /**
     * 胡牌判断
     *
     * @param indices            手上的牌
     * @param card               当前牌
     * @param weaveItems         面牌组合
     * @param self               是否自己摸到牌
     * @param chair              供应者
     * @param source             检测类型
     * @param dispatchCardNumber 派发牌的数量
     * @return 胡牌类型列表
     */
    public H estimateH(byte[] indices, byte card, List<WeaveItem> weaveItems, boolean self, int chair, Source source, int dispatchCardNumber) {
        byte[] copyCardIndices = Arrays.copyOf(indices, indices.length);
        if (!self) {
            copyCardIndices[MahjongKit.switchCardToIndex(card)] += 1;
        }
        List<H._H> hs = new ArrayList<>();
        for (HRule hRule : rules) {
            H._H h = hRule.run(chair, Arrays.copyOf(copyCardIndices, copyCardIndices.length), card, weaveItems, self, source);
            if (h != null) {
                hs.add(h);
            }
        }
        if (hs.size() > 0) {
            return new H(hs);
        }
        return null;
    }

}
