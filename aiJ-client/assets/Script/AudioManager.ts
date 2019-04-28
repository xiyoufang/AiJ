export default class AudioManager {


    /**
     * 播放背景音乐
     */
    public static play_music(pkgName: string, resName: string) {
        const pi = fgui.UIPackage.getItemByURL(fgui.UIPackage.getItemURL(pkgName, resName));
        cc.audioEngine.playMusic(<cc.AudioClip>pi.owner.getItemAsset(pi), true);
    }

    /**
     * 播放特效
     * @param pkgName
     * @param resName
     */
    public static play_effect(pkgName: string, resName: string) {
        const pi = fgui.UIPackage.getItemByURL(fgui.UIPackage.getItemURL(pkgName, resName));
        cc.audioEngine.playEffect(<cc.AudioClip>pi.owner.getItemAsset(pi), true);
    }

    /**
     * 停止背景音乐
     */
    public static stop_music() {
        cc.audioEngine.stopMusic();
    }

}
