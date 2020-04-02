package com.xiyoufang.aij.room.response;

import com.xiyoufang.aij.response.CommonResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class HeroSceneResponse extends CommonResponse {

    public static class HeroItem {
        /**
         * 椅子
         */
        private int chair;
        /**
         * 显示用的ID
         */
        private String showId;
        /**
         * 用户ID
         */
        private String userId;
        /**
         * 昵称
         */
        private String nickName;

        /**
         * 在线状态
         */
        private boolean online;
        /**
         * 坐下状态
         */
        private boolean sitDown;

        public int getChair() {
            return chair;
        }

        public void setChair(int chair) {
            this.chair = chair;
        }

        public String getShowId() {
            return showId;
        }

        public void setShowId(String showId) {
            this.showId = showId;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getNickName() {
            return nickName;
        }

        public void setNickName(String nickName) {
            this.nickName = nickName;
        }

        public boolean isOnline() {
            return online;
        }

        public void setOnline(boolean online) {
            this.online = online;
        }

        public boolean isSitDown() {
            return sitDown;
        }

        public void setSitDown(boolean sitDown) {
            this.sitDown = sitDown;
        }
    }

    private List<HeroItem> heroes = new ArrayList<>();

    public List<HeroItem> getHeroes() {
        return heroes;
    }

    public void setHeroes(List<HeroItem> heroes) {
        this.heroes = heroes;
    }
}
