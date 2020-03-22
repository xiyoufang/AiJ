package com.xiyoufang.aij.platform.render;

import com.jfinal.render.Render;
import com.jfinal.render.RenderException;
import org.apache.commons.io.IOUtils;

import java.io.InputStream;
import java.io.OutputStream;

/**
 * Created by 席有芳 on 2019-02-23.
 *
 * @author 席有芳
 */
public class ImageRender extends Render {

    /**
     * 流
     */
    private InputStream in;

    /**
     * @param in in
     */
    public ImageRender(InputStream in) {
        this.in = in;
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
        try (OutputStream out = response.getOutputStream(); InputStream in = this.in) {
            IOUtils.copy(in, out);
        } catch (Exception e) {
            throw new RenderException(e);
        }
    }
}
