package com.xiyoufang.aij.platform.render;

import com.jfinal.kit.LogKit;
import com.jfinal.render.Render;
import com.jfinal.render.RenderException;

import java.io.*;

/**
 * Created by 席有芳 on 2019-02-23.
 *
 * @author 席有芳
 */
public class ImageRender extends Render {

    /**
     * 图片文件
     */
    private File image;

    /**
     * @param image image
     */
    public ImageRender(File image) {
        this.image = image;
    }

    /**
     * 渲染
     */
    public void render() {
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Cache-Control", "no-cache");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setDateHeader("Expires", 0);
        response.setContentType("image/png");
        InputStream inputStream = null;
        OutputStream outputStream = null;
        try {
            inputStream = new BufferedInputStream(new FileInputStream(image));
            outputStream = response.getOutputStream();
            byte[] buffer = new byte[1024];
            for (int len = -1; (len = inputStream.read(buffer)) != -1; ) {
                outputStream.write(buffer, 0, len);
            }
            outputStream.flush();
        } catch (IOException e) {    // ClientAbortException、EofException 直接或间接继承自 IOException
            String name = e.getClass().getSimpleName();
            if (name.equals("ClientAbortException") || name.equals("EofException")) {
                LogKit.warn(name);
            } else {
                throw new RenderException(e);
            }
        } catch (Exception e) {
            throw new RenderException(e);
        } finally {
            if (inputStream != null) {
                try {
                    inputStream.close();
                } catch (IOException e) {
                    LogKit.error(e.getMessage(), e);
                }
            }
            if (outputStream != null) {
                try {
                    outputStream.close();
                } catch (IOException e) {
                    LogKit.error(e.getMessage(), e);
                }
            }
        }
    }
}
