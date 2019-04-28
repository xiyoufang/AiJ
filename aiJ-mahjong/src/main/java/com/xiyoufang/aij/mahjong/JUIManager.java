package com.xiyoufang.aij.mahjong;

import javax.swing.*;
import javax.swing.border.TitledBorder;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class JUIManager {
    /**
     * 实例
     */
    private static JUIManager instance;
    /**
     * 按钮
     */
    private Map<Integer, Map<Integer, JButton>> chairButtons = new HashMap<>();
    /**
     * 标题
     */
    private Map<Integer, TitledBorder> chairTitledBorder = new HashMap<>();
    /**
     * 出牌界面
     */
    private Map<Integer, JTextPane> chairJTextPane = new HashMap<>();
    /**
     * 组合面板
     */
    private Map<Integer, JPanel> chairWeaveItemsJPanel = new HashMap<>();

    public final static int _0 = 0;
    public final static int _1 = 1;
    public final static int _2 = 2;
    public final static int _3 = 3;
    public final static int _4 = 4;
    public final static int _5 = 5;
    public final static int _6 = 6;
    public final static int _7 = 7;
    public final static int _8 = 8;
    public final static int _9 = 9;
    public final static int _10 = 10;
    public final static int _11 = 11;
    public final static int _12 = 12;
    public final static int _13 = 13;
    public final static int _H = 20;
    public final static int _G = 21;
    public final static int _P = 22;
    public final static int _N = 23;

    //进入-离开
    public final static int _ENTER = 24;
    public final static int _LEAVE = 25;
    public final static int _AGREE = 26;
    public final static int _REFUSE = 27;

    public static JUIManager getInstance() {
        if (instance == null) {
            instance = new JUIManager();
        }
        return instance;
    }

    /**
     * 添加按钮
     *
     * @param chair        chair
     * @param titledBorder titledBorder
     */
    public void addTitledBorder(int chair, TitledBorder titledBorder) {
        chairTitledBorder.put(chair, titledBorder);
    }

    /**
     * 获取 TitledBorder
     *
     * @param chair chair
     * @return TitledBorder
     */
    public TitledBorder getTitledBorder(int chair) {
        return chairTitledBorder.get(chair);
    }

    /**
     * 添加出牌界面
     *
     * @param chair    chair
     * @param textPane textPane
     */
    public void addDiscardJTextPane(int chair, JTextPane textPane) {
        chairJTextPane.put(chair, textPane);
    }

    /**
     * chair
     *
     * @param chair chair
     * @return JTextPane
     */
    public JTextPane getDiscardJTextPane(int chair) {
        return chairJTextPane.get(chair);
    }

    /**
     * @param chair  chair
     * @param jPanel jPanel
     */
    public void addWeaveItemsJPanel(int chair, JPanel jPanel) {
        chairWeaveItemsJPanel.put(chair, jPanel);
    }

    /**
     * @param chair chair
     */
    public JPanel getWeaveItemsJPanel(int chair) {
        return chairWeaveItemsJPanel.get(chair);
    }

    /**
     * 添加按钮
     *
     * @param chair  chair
     * @param index  index
     * @param button button
     */
    public void addJButton(int chair, int index, JButton button) {
        if (!chairButtons.containsKey(chair)) {
            chairButtons.put(chair, new HashMap<Integer, JButton>());
        }
        Map<Integer, JButton> jButtons = chairButtons.get(chair);
        if (!jButtons.containsKey(index)) {
            jButtons.put(index, button);
        }
    }

    /**
     * 获取按钮
     *
     * @param chair chair
     * @param index index
     * @return JButton
     */
    public JButton getJButton(int chair, int index) {
        Map<Integer, JButton> jButtons = chairButtons.get(chair);
        return jButtons == null ? null : jButtons.get(index);
    }

    public Map<Integer, Map<Integer, JButton>> getChairButtons() {
        return chairButtons;
    }

    public Map<Integer, TitledBorder> getChairTitledBorder() {
        return chairTitledBorder;
    }

}
