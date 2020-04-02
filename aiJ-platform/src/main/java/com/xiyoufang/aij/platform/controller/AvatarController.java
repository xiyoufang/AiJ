package com.xiyoufang.aij.platform.controller;

import com.jfinal.core.Controller;
import com.jfinal.kit.StrKit;
import com.xiyoufang.aij.platform.render.ImageRender;
import com.xiyoufang.aij.utils.ClassResource;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.cert.X509Certificate;

/**
 * Created by 席有芳 on 2019-02-23.
 *
 * @author 席有芳
 */
public class AvatarController extends Controller {

    /**
     * 日志
     */
    private final static Logger LOGGER = LoggerFactory.getLogger(AvatarController.class);

    /**
     * https 证书管理
     */
    private static class TrustAnyTrustManager implements X509TrustManager {

        public X509Certificate[] getAcceptedIssuers() {
            return null;
        }

        public void checkClientTrusted(X509Certificate[] chain, String authType) {
        }

        public void checkServerTrusted(X509Certificate[] chain, String authType) {
        }
    }

    private static final SSLSocketFactory sslSocketFactory = initSSLSocketFactory();

    /**
     * 初始化SSLSocketFactory
     *
     * @return SSLSocketFactory
     */
    private static SSLSocketFactory initSSLSocketFactory() {
        try {
            TrustManager[] tm = {new TrustAnyTrustManager()};
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, tm, new java.security.SecureRandom());
            return sslContext.getSocketFactory();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 获取头像
     */
    public void index(String url) {
        try {
            if (StrKit.isBlank(url)) {
                throw new Exception("url为空");
            }
            InputStream in = new ByteArrayInputStream(Jsoup.connect(url)
                    .sslSocketFactory(sslSocketFactory)
                    .ignoreContentType(true).timeout(20 * 1000)
                    .userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36")
                    .method(Connection.Method.GET).execute().bodyAsBytes());
            render(new ImageRender(in));
        } catch (Exception e) {
            LOGGER.error("获取远程头像失败!", e);
            try {
                InputStream in = ClassResource.getClassLoader().getResourceAsStream("default_avatar.png");
                if (in != null) {
                    render(new ImageRender(in));
                } else {
                    throw new IOException("默认头像[default_avatar.png]不存在!");
                }
            } catch (IOException ioE) {
                LOGGER.error("读取本地默认头像失败!", e);
                renderQrCode("https://www.xiyoufang.com", 96, 96);
            }
        }

    }
}
