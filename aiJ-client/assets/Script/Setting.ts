export default class Setting {

    /**
     * 设置背景音乐
     * @param enable
     */
    public static setMusic(enable: boolean) {
        this.set("music", enable);
    }

    public static getMusic(): boolean {
        return this.get("music") == null ? true : this.get("music");
    }

    /**
     * 设置音效
     * @param enable
     */
    public static setSound(enable: boolean) {
        this.set("sound", enable);
    }

    public static getSound(): boolean {
        return this.get("sound") == null ? true : this.get("sound");
    }

    /**
     * 设置
     * @param key
     * @param value
     */
    public static set(key: string, value: any): void {
        cc.sys.localStorage.setItem(key, value);
    }

    /**
     * 读取
     * @param key
     */
    public static get(key: string): any {
        return cc.sys.localStorage.getItem(key);
    }

}
