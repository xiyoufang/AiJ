package com.xiyoufang.aij.mahjong;

import com.neovisionaries.ws.client.WebSocket;
import com.xiyoufang.aij.core.EventFactory;
import com.xiyoufang.aij.mahjong.event.OperateEvent;
import com.xiyoufang.aij.mahjong.event.OutCardEvent;
import com.xiyoufang.aij.mahjong.response.*;
import com.xiyoufang.aij.mahjong.struct.WeaveItem;
import com.xiyoufang.aij.room.event.DismissVoteTableEvent;
import com.xiyoufang.aij.room.event.JoinTableEvent;
import com.xiyoufang.aij.room.response.CreateTableEventResponse;
import com.xiyoufang.aij.room.response.JoinTableEventResponse;
import com.xiyoufang.aij.room.table.Table;
import com.xiyoufang.aij.room.table.TableAbility;
import com.xiyoufang.aij.room.table.TableManager;
import com.xiyoufang.aij.room.tester.TesterHero;
import com.xiyoufang.aij.room.tester.TesterHeroManager;
import org.fest.reflect.core.Reflection;
import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.imgscalr.Scalr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;
import javax.swing.*;
import javax.swing.GroupLayout.Alignment;
import javax.swing.LayoutStyle.ComponentPlacement;
import javax.swing.border.EmptyBorder;
import javax.swing.border.EtchedBorder;
import javax.swing.border.TitledBorder;
import java.awt.*;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.awt.image.BufferedImage;
import java.text.MessageFormat;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-25.
 *
 * @author 席有芳
 */
public class MahjongRoomAiJTesterGui extends MouseAdapter {
    /**
     * 椅子
     */
    private final static String CHAIR_KEY = "_CHAIR_KYE_";
    /**
     * 值
     */
    private final static String CARD_KEY = "_CARD_KYE_";
    /**
     * 按钮标记
     */
    private final static String INDEX_KEY = "_INDEX_KEY_";
    /**
     * 主框架
     */
    private JFrame frame;
    /**
     * 桌子编号
     */
    private int tableNo = Table.INVALID_TABLE;
    /**
     * 剩余牌
     */
    private JTextPane leftCardTextPane = new JTextPane();
    /**
     * 牌图标的缓存
     */
    private Map<String, ImageIcon> cardIconCache = new HashMap<>();

    /**
     * Launch the application.
     */
    public void initJFrame() {
        frame = new JFrame();
        frame.setBounds(100, 100, 820, 720);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setLocationRelativeTo(null);
        frame.setTitle("Tester");
        EventQueue.invokeLater(new Runnable() {
            public void run() {
                initGroupLayout();
                frame.setVisible(true);
            }
        });
    }

    private final static Logger LOGGER = LoggerFactory.getLogger(MahjongRoomAiJTesterGui.class);

    public MahjongRoomAiJTesterGui() {
        EventBus.getDefault().register(this);
        initJFrame();
    }

    private void initGroupLayout() {
        JPanel panel0 = createJPanel(0);
        JPanel panel1 = createJPanel(1);
        JPanel panel2 = createJPanel(2);
        JPanel panel3 = createJPanel(3);
        JPanel panel = createMessageJPanel();
        GroupLayout groupLayout = new GroupLayout(frame.getContentPane());
        groupLayout.setHorizontalGroup(
                groupLayout.createParallelGroup(Alignment.LEADING)
                        .addGroup(Alignment.TRAILING, groupLayout.createSequentialGroup()
                                .addContainerGap()
                                .addGroup(groupLayout.createParallelGroup(Alignment.TRAILING)
                                        .addComponent(panel0, Alignment.LEADING, GroupLayout.PREFERRED_SIZE, 808, Short.MAX_VALUE)
                                        .addComponent(panel1, Alignment.LEADING, GroupLayout.PREFERRED_SIZE, 808, Short.MAX_VALUE)
                                        .addComponent(panel2, Alignment.LEADING, GroupLayout.PREFERRED_SIZE, 808, Short.MAX_VALUE)
                                        .addComponent(panel3, Alignment.LEADING, GroupLayout.PREFERRED_SIZE, 808, Short.MAX_VALUE)
                                        .addComponent(panel, Alignment.LEADING, GroupLayout.PREFERRED_SIZE, 808, Short.MAX_VALUE))
                                .addContainerGap())
        );
        groupLayout.setVerticalGroup(
                groupLayout.createParallelGroup(Alignment.LEADING)
                        .addGroup(groupLayout.createSequentialGroup()
                                .addContainerGap()
                                .addComponent(panel0, GroupLayout.PREFERRED_SIZE, 140, GroupLayout.PREFERRED_SIZE)
                                .addPreferredGap(ComponentPlacement.RELATED)
                                .addComponent(panel1, GroupLayout.PREFERRED_SIZE, 140, GroupLayout.PREFERRED_SIZE)
                                .addPreferredGap(ComponentPlacement.RELATED)
                                .addComponent(panel2, GroupLayout.PREFERRED_SIZE, 140, GroupLayout.PREFERRED_SIZE)
                                .addPreferredGap(ComponentPlacement.RELATED)
                                .addComponent(panel3, GroupLayout.PREFERRED_SIZE, 140, GroupLayout.PREFERRED_SIZE)
                                .addPreferredGap(ComponentPlacement.RELATED)
                                .addComponent(panel, GroupLayout.PREFERRED_SIZE, 180, Short.MAX_VALUE)
                                .addContainerGap())
        );
        frame.getContentPane().setLayout(groupLayout);
    }

    private JPanel createMessageJPanel() {
        JPanel panel = new JPanel();
        panel.setBorder(new TitledBorder(null, "Message", TitledBorder.LEADING, TitledBorder.TOP, null, null));
        JLabel lblNewLabel = new JLabel("剩余的牌:");
        leftCardTextPane.setEditable(false);
        GroupLayout gl_panel = new GroupLayout(panel);
        gl_panel.setHorizontalGroup(
                gl_panel.createParallelGroup(Alignment.LEADING)
                        .addGroup(gl_panel.createSequentialGroup()
                                .addContainerGap()
                                .addGroup(gl_panel.createParallelGroup(Alignment.LEADING)
                                        .addComponent(leftCardTextPane, GroupLayout.PREFERRED_SIZE, 784, GroupLayout.PREFERRED_SIZE)
                                        .addComponent(lblNewLabel))
                                .addContainerGap())
        );
        gl_panel.setVerticalGroup(
                gl_panel.createParallelGroup(Alignment.LEADING)
                        .addGroup(gl_panel.createSequentialGroup()
                                .addComponent(lblNewLabel)
                                .addPreferredGap(ComponentPlacement.RELATED)
                                .addComponent(leftCardTextPane, GroupLayout.PREFERRED_SIZE, GroupLayout.DEFAULT_SIZE, GroupLayout.PREFERRED_SIZE)
                                .addContainerGap(38, Short.MAX_VALUE))
        );
        panel.setLayout(gl_panel);
        return panel;
    }

    private JPanel createJPanel(int chair) {
        JPanel panel = new JPanel();
        panel.setBorder(createChairTitledBorder(chair));
        //牌按钮
        createJButton(chair, JUIManager._0);
        createJButton(chair, JUIManager._1);
        createJButton(chair, JUIManager._2);
        createJButton(chair, JUIManager._3);
        createJButton(chair, JUIManager._4);
        createJButton(chair, JUIManager._5);
        createJButton(chair, JUIManager._6);
        createJButton(chair, JUIManager._7);
        createJButton(chair, JUIManager._8);
        createJButton(chair, JUIManager._9);
        createJButton(chair, JUIManager._10);
        createJButton(chair, JUIManager._11);
        createJButton(chair, JUIManager._12);
        createJButton(chair, JUIManager._13);
        //操作按钮
        createJButton(chair, JUIManager._H, "胡");
        createJButton(chair, JUIManager._G, "杠");
        createJButton(chair, JUIManager._P, "碰");
        createJButton(chair, JUIManager._N, "过");
        createJButton(chair, JUIManager._ENTER, "进入");
        createJButton(chair, JUIManager._LEAVE, "离开");
        createJButton(chair, JUIManager._AGREE, "解散");
        createJButton(chair, JUIManager._REFUSE, "拒绝");
        JLabel label = new JLabel("出的牌:");
        JTextPane textPane_1 = createDiscardJTextPane(chair);
        JPanel weaveItemsJPanel = createWeaveItemsJPanel(chair);
        GroupLayout gl_panel2 = new GroupLayout(panel);
        gl_panel2.setHorizontalGroup(
                gl_panel2.createParallelGroup(Alignment.LEADING)
                        .addGroup(gl_panel2.createSequentialGroup()
                                .addGroup(gl_panel2.createParallelGroup(Alignment.LEADING)
                                        .addGroup(gl_panel2.createSequentialGroup()
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._H), GroupLayout.PREFERRED_SIZE, 48, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._G), GroupLayout.PREFERRED_SIZE, 48, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._P), GroupLayout.PREFERRED_SIZE, 48, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._N), GroupLayout.PREFERRED_SIZE, 48, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._ENTER), GroupLayout.PREFERRED_SIZE, 64, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._LEAVE), GroupLayout.PREFERRED_SIZE, 64, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._AGREE), GroupLayout.PREFERRED_SIZE, 64, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._REFUSE), GroupLayout.PREFERRED_SIZE, 64, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(weaveItemsJPanel, GroupLayout.PREFERRED_SIZE, GroupLayout.DEFAULT_SIZE, GroupLayout.PREFERRED_SIZE)
                                        )
                                        .addGroup(gl_panel2.createSequentialGroup()
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._0), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._1), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._2), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._3), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._4), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._5), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._6), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._7), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._8), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._9), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._10), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._11), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._12), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE)
                                                .addPreferredGap(ComponentPlacement.RELATED)
                                                .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._13), GroupLayout.PREFERRED_SIZE, 51, GroupLayout.PREFERRED_SIZE))
                                        .addGroup(gl_panel2.createSequentialGroup()
                                                .addContainerGap()
                                                .addComponent(label)
                                                .addPreferredGap(ComponentPlacement.UNRELATED)
                                                .addComponent(textPane_1, GroupLayout.PREFERRED_SIZE, GroupLayout.DEFAULT_SIZE, GroupLayout.PREFERRED_SIZE)))
                                .addContainerGap(GroupLayout.DEFAULT_SIZE, Short.MAX_VALUE))
        );
        gl_panel2.setVerticalGroup(
                gl_panel2.createParallelGroup(Alignment.LEADING)
                        .addGroup(gl_panel2.createSequentialGroup()
                                .addGroup(gl_panel2.createParallelGroup(Alignment.BASELINE)
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._0))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._1))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._2))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._3))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._4))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._5))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._6))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._7))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._8))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._9))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._10))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._11))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._12))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._13)))
                                .addPreferredGap(ComponentPlacement.RELATED, 11, Short.MAX_VALUE)
                                .addGroup(gl_panel2.createParallelGroup(Alignment.BASELINE)
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._H))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._G))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._P))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._N))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._ENTER))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._LEAVE))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._AGREE))
                                        .addComponent(JUIManager.getInstance().getJButton(chair, JUIManager._REFUSE))
                                        .addComponent(weaveItemsJPanel)
                                )
                                .addPreferredGap(ComponentPlacement.RELATED)
                                .addGroup(gl_panel2.createParallelGroup(Alignment.LEADING)
                                        .addComponent(label)
                                        .addComponent(textPane_1))
                                .addContainerGap(10, Short.MAX_VALUE))
        );
        panel.setLayout(gl_panel2);
        return panel;
    }

    /**
     * 显示组合的面板
     *
     * @param chair chair
     * @return JPanel
     */
    private JPanel createWeaveItemsJPanel(int chair) {
        JPanel jPanel = new JPanel();
        jPanel.setLayout(new BoxLayout(jPanel, BoxLayout.X_AXIS));
        JUIManager.getInstance().addWeaveItemsJPanel(chair, jPanel);
        return jPanel;
    }

    /**
     * 创建带图片的牌
     *
     * @param card card
     * @return JLabel
     */
    private JLabel createCardJLabel(byte card) {
        JLabel jLabel = new JLabel(getCardImagesIcon(card, 0.25));
        jLabel.setOpaque(true);
        jLabel.setBackground(Color.WHITE);
        return jLabel;
    }

    /**
     * 显示打出的
     *
     * @param chair chair
     * @return JTextPane
     */
    private JTextPane createDiscardJTextPane(int chair) {
        JTextPane textPane = new JTextPane();
        textPane.setEditable(false);
        JUIManager.getInstance().addDiscardJTextPane(chair, textPane);
        return textPane;
    }

    /**
     * 创建面板标题
     *
     * @param chair chair
     * @return TitledBorder
     */
    private TitledBorder createChairTitledBorder(int chair) {
        TitledBorder titledBorder = new TitledBorder(new EtchedBorder(EtchedBorder.LOWERED, null, null), "Chair",
                TitledBorder.LEADING, TitledBorder.TOP, null, Color.BLACK);
        JUIManager.getInstance().addTitledBorder(chair, titledBorder);
        return titledBorder;
    }


    /**
     * 创建按钮
     *
     * @param chair chair
     * @param index index
     */
    private void createJButton(int chair, int index) {
        createJButton(chair, index, "");
    }

    /**
     * @param chair chair
     * @param index index
     * @param name  name
     */
    private void createJButton(int chair, int index, String name) {
        JButton button = new JButton(name);
        button.putClientProperty(CHAIR_KEY, chair);
        button.putClientProperty(INDEX_KEY, index);
        button.putClientProperty(CARD_KEY, (byte) -1);
        button.addMouseListener(this);
        JUIManager.getInstance().addJButton(chair, index, button);
    }

    /**
     * {@inheritDoc}
     *
     * @param e
     */
    @Override
    public void mousePressed(MouseEvent e) {
        Object source = e.getSource();
        if (source instanceof JButton) {
            JButton button = (JButton) source;
            int chair = (int) button.getClientProperty(CHAIR_KEY);
            int index = (int) button.getClientProperty(INDEX_KEY);
            byte card = (byte) button.getClientProperty(CARD_KEY);
            WebSocket ws = TesterHeroManager.getInstance().getTesterHero(chair).getWebSocket();
            LOGGER.info("椅子:{},按钮:{},牌:{}触发", chair, index, card);
            if (Arrays.asList(MouseEvent.BUTTON1, MouseEvent.BUTTON3).contains(e.getButton())) { //鼠标右键
                switch (index) {
                    case JUIManager._H:
                        OperateEvent hEvent = EventFactory.create(OperateEvent.class);
                        hEvent.setAction(MahjongConst.H);
                        hEvent.setCard(card);
                        ws.sendText(hEvent.toJson());
                        break;
                    case JUIManager._G:
                        OperateEvent gEvent = EventFactory.create(OperateEvent.class);
                        gEvent.setAction(MahjongConst.G);
                        gEvent.setCard(card);
                        ws.sendText(gEvent.toJson());
                        break;
                    case JUIManager._P:
                        OperateEvent pEvent = EventFactory.create(OperateEvent.class);
                        pEvent.setAction(MahjongConst.P);
                        pEvent.setCard(card);
                        ws.sendText(pEvent.toJson());
                        break;
                    case JUIManager._N:
                        OperateEvent nEvent = EventFactory.create(OperateEvent.class);
                        nEvent.setAction(MahjongConst.N);
                        nEvent.setCard(card);
                        ws.sendText(nEvent.toJson());
                        break;
                    case JUIManager._ENTER:
                        JoinTableEvent enterTableEvent = EventFactory.create(JoinTableEvent.class);
                        enterTableEvent.setTableNo(this.tableNo);
                        ws.sendText(enterTableEvent.toJson());
                        break;
                    case JUIManager._AGREE:
                        DismissVoteTableEvent agreeDismissVoteTableEvent = EventFactory.create(DismissVoteTableEvent.class);
                        agreeDismissVoteTableEvent.setAgree(true);
                        ws.sendText(agreeDismissVoteTableEvent.toJson());
                        break;
                    case JUIManager._REFUSE:
                        DismissVoteTableEvent refuseDismissVoteTableEvent = EventFactory.create(DismissVoteTableEvent.class);
                        refuseDismissVoteTableEvent.setAgree(false);
                        ws.sendText(refuseDismissVoteTableEvent.toJson());
                        break;
                    default:
                        if (card != -1) {
                            OutCardEvent event = EventFactory.create(OutCardEvent.class);
                            event.setCard(card);
                            ws.sendText(event.toJson());
                        }
                }
            }
        }
    }

    /**
     * 更新按钮
     *
     * @param chair chair
     * @param cards cards
     */
    private void updateChairButtons(final int chair, final byte[] cards) {
        EventQueue.invokeLater(new Runnable() {
            public void run() {
                for (Map.Entry<Integer, JButton> buttonEntry : JUIManager.getInstance().getChairButtons().get(chair).entrySet()) {
                    if (buttonEntry.getKey() <= JUIManager._13) {
                        JButton jButton = buttonEntry.getValue();
                        jButton.putClientProperty(CARD_KEY, (byte) -1);
                        jButton.setIcon(null);
                    }
                }
                for (int i = 0; i < cards.length; i++) {
                    JButton jButton = JUIManager.getInstance().getJButton(chair, i);
                    jButton.putClientProperty(CARD_KEY, cards[i]);

                    jButton.setIcon(getCardImagesIcon(cards[i], 0.3));

                }
            }
        });
    }

    /**
     * 获取牌的图标
     *
     * @param card  card
     * @param scale 缩放比例
     * @return ImageIcon
     */
    private ImageIcon getCardImagesIcon(byte card, double scale) {
        try {
            String url = "/images/" + MahjongKit.getCardType(card).getValue() + "" + MahjongKit.getCardValue(card) + ".png";
            String key = scale + url;
            ImageIcon icon = cardIconCache.get(key);
            if (icon == null) {
                BufferedImage source = ImageIO.read(this.getClass().getResourceAsStream(url));
                icon = new ImageIcon(Scalr.resize(source, Scalr.Method.SPEED, (int) (source.getWidth() * scale), (int) (source.getHeight() * scale), Scalr.OP_ANTIALIAS));
                cardIconCache.put(key, icon);
            }
            return icon;
        } catch (Exception e) {
            LOGGER.error("加载图片错误!", e);
        }
        return null;
    }

    /**
     * 激活当前椅子
     *
     * @param chair chair
     */
    private void activatedCurrChair(final int chair) {
        EventQueue.invokeLater(new Runnable() {
            public void run() {
                for (TitledBorder value : JUIManager.getInstance().getChairTitledBorder().values()) {
                    value.setTitleColor(Color.BLACK);
                }
                TitledBorder titledBorder = JUIManager.getInstance().getTitledBorder(chair);
                titledBorder.setTitleColor(Color.RED);
                frame.repaint();
            }
        });

    }

    /**
     * 组合
     */
    private void updateWeaveItemsJPanel() {
        TableAbility tableAbility = TableManager.getInstance().getTable(this.tableNo).getTableAbility();
        int chairCount = Reflection.field("chairCount").ofType(int.class).in(tableAbility).get();
        for (int chair = 0; chair < chairCount; chair++) {
            final List weaveItems = Reflection.method("getWeaveItems").withReturnType(List.class).withParameterTypes(int.class).in(tableAbility).invoke(chair);
            final JPanel jPanel = JUIManager.getInstance().getWeaveItemsJPanel(chair);
            EventQueue.invokeLater(new Runnable() {
                public void run() {
                    for (Component component : jPanel.getComponents()) {
                        if (component instanceof JLabel) {
                            jPanel.remove(component);
                        }
                    }
                    for (Object object : weaveItems) {
                        WeaveItem weaveItem = (WeaveItem) object;
                        switch (weaveItem.getWeaveType()) {
                            case P:
                                for (int i = 0; i < 3; i++) {
                                    jPanel.add(createCardJLabel(weaveItem.getCenterCard()));
                                }
                                break;
                            case G:
                                for (int i = 0; i < 4; i++) {
                                    jPanel.add(createCardJLabel(weaveItem.getCenterCard()));
                                }
                                break;
                            case C:
                                break;
                        }
                        JLabel borderLabel = new JLabel();
                        borderLabel.setBorder(new EmptyBorder(0, 0, 0, 5));
                        jPanel.add(borderLabel);
                    }
                    jPanel.revalidate();
                    jPanel.repaint();
                }
            });
        }
    }

    /**
     * 更新椅子
     */
    private void updateCards() {//从服务器内存中获取信息
        TableAbility tableAbility = TableManager.getInstance().getTable(this.tableNo).getTableAbility();
        int chairCount = Reflection.field("chairCount").ofType(int.class).in(tableAbility).get();
        for (int chair = 0; chair < chairCount; chair++) {
            byte[] indices = Reflection.field("cardIndices").ofType(byte[][].class).in(tableAbility).get()[chair];
            updateChairButtons(chair, MahjongKit.switchIndicesToCards(indices));
            updateChairDiscardJTextPane(chair);
        }
        //更新剩余的牌
        byte[] repertoryCard = Reflection.field("repertoryCard").ofType(byte[].class).in(tableAbility).get();
        int leftCardCount = Reflection.field("leftCardCount").ofType(int.class).in(tableAbility).get();
        final StringBuilder sb = buildCardsName(leftCardCount, repertoryCard);
        EventQueue.invokeLater(new Runnable() {
            public void run() {
                leftCardTextPane.setText(sb.toString());
            }
        });

    }

    private void updateChairDiscardJTextPane(final int chair) {
        TableAbility tableAbility = TableManager.getInstance().getTable(this.tableNo).getTableAbility();
        int discardCount = Reflection.field("discardCount").ofType(int[].class).in(tableAbility).get()[chair];
        byte[] cards = Reflection.field("discardCards").ofType(byte[][].class).in(tableAbility).get()[chair];
        final StringBuilder sb = buildCardsName(discardCount, cards);
        EventQueue.invokeLater(new Runnable() {
            public void run() {
                JUIManager.getInstance().getDiscardJTextPane(chair).setText(sb.toString());
            }
        });

    }


    /**
     * 更新按钮颜色
     *
     * @param button button
     * @param card   card
     * @param color  颜色
     */
    private void updateOperateButton(final JButton button, final byte card, final Color color) {
        EventQueue.invokeLater(new Runnable() {
            public void run() {
                button.putClientProperty(CARD_KEY, card);
                button.setForeground(color);
                button.repaint();
            }
        });
    }

    private StringBuilder buildCardsName(int count, byte[] cards) {
        final StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            String cardTitle = MahjongKit.getCardTitle(cards[i]);
            sb.append(cardTitle);
            if (i < count - 1) {
                sb.append(", ");
            }
        }
        return sb;
    }

    /**
     * 创建桌子
     *
     * @param response response
     */
    @Subscribe
    public void createTable(CreateTableEventResponse response) {
        this.tableNo = response.getTableNo();
        this.frame.setTitle(MessageFormat.format("当前桌子编号{0}", response.getTableNo()));
    }

    /**
     * @param response response
     */
    @Subscribe
    public void joinTable(JoinTableEventResponse response) {
        int chair = response.getChair();
        TitledBorder titledBorder = JUIManager.getInstance().getTitledBorder(chair);
        TesterHero testerHero = TesterHeroManager.getInstance().getTesterHero(chair);
        titledBorder.setTitle(testerHero.getUserName());
    }

    /**
     * @param response response
     */
    @Subscribe
    public void gameStart(GameStartEventResponse response) {
        byte[] cards = response.getCards();
        int chair = response.getChair();
        updateChairButtons(chair, cards);
    }

    /**
     * 发牌
     *
     * @param response response
     */
    @Subscribe
    public void dispatchCard(DispatchCardEventResponse response) {
        activatedCurrChair(response.getChair());
        updateCards();
    }

    /**
     * 出牌
     *
     * @param response response
     */
    @Subscribe
    public void outCard(OutCardEventResponse response) {
        updateCards();
    }

    /**
     * 操作通知
     *
     * @param response response
     */
    @Subscribe
    public void operateNotify(OperateNotifyEventResponse response) {
        int chair = response.getChair();
        activatedCurrChair(chair);
        int action = response.getAction();
        if ((action & MahjongConst.P) != 0) {
            JButton button = JUIManager.getInstance().getJButton(chair, JUIManager._P);
            updateOperateButton(button, response.getCard(), Color.RED);
        }
        if ((action & MahjongConst.H) != 0) {
            JButton button = JUIManager.getInstance().getJButton(chair, JUIManager._H);
            updateOperateButton(button, response.getCard(), Color.RED);
        }
        if ((action & MahjongConst.G) != 0) {
            JButton button = JUIManager.getInstance().getJButton(chair, JUIManager._G);
            updateOperateButton(button, response.getCard(), Color.RED);
        }
        JButton button = JUIManager.getInstance().getJButton(chair, JUIManager._N);
        updateOperateButton(button, response.getCard(), Color.RED);
    }

    /**
     * 操作结果
     *
     * @param response response
     */
    @Subscribe
    public void operateResult(OperateResultEventResponse response) {
        TableAbility tableAbility = TableManager.getInstance().getTable(this.tableNo).getTableAbility();
        int chairCount = Reflection.field("chairCount").ofType(int.class).in(tableAbility).get();
        for (int chair = 0; chair < chairCount; chair++) {
            updateOperateButton(JUIManager.getInstance().getJButton(chair, JUIManager._P), (byte) -1, Color.BLACK);
            updateOperateButton(JUIManager.getInstance().getJButton(chair, JUIManager._G), (byte) -1, Color.BLACK);
            updateOperateButton(JUIManager.getInstance().getJButton(chair, JUIManager._H), (byte) -1, Color.BLACK);
            updateOperateButton(JUIManager.getInstance().getJButton(chair, JUIManager._N), (byte) -1, Color.BLACK);
        }
        updateCards();
        updateWeaveItemsJPanel();

    }
}
