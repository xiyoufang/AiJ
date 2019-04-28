/**
 * 玩家管理
 */
import Hero from "./Hero";

export default class HeroManager {

    /**
     * 玩家缓存，用户缓存用户基本信息
     */
    heroes: { [userId: string]: Hero } = {};
    /**
     * 自己
     */
    private _me: Hero;
    /**
     * 单例
     */
    private static inst: HeroManager;

    public static getInst(): HeroManager {
        if (HeroManager.inst == null) {
            HeroManager.inst = new HeroManager();
        }
        return HeroManager.inst;
    }

    /**
     * 获取玩家
     * @param userId
     */
    public getHero(userId: string): Hero {
        return this.heroes[userId];
    }

    /**
     * 添加玩家
     * @param hero
     */
    public addHero(hero: Hero): void {
        this.heroes[hero.userId] = hero;
    }

    /**
     *
     * @param me
     */
    public setMe(me: Hero): void {
        this.addHero(me);
        this._me = me;
    }

    /**
     * get me
     */
    public getMe(): Hero {
        return this._me;
    }
}
