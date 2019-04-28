package com.xiyoufang.aij.utils;

/**
 * Created by 席有芳 on 2019-02-20.
 *
 * @author 席有芳
 */
public class ClassResource {

    /**
     * 获取ClassLoader
     *
     * @return ClassLoader
     */
    public static ClassLoader getClassLoader() {
        ClassLoader ret = Thread.currentThread().getContextClassLoader();
        return ret != null ? ret : ClassResource.class.getClassLoader();
    }

    /**
     * 构建文件名
     *
     * @param basePath basePath
     * @param fileName fileName
     * @return FullName
     */
    public static String buildFinalFileName(String basePath, String fileName) {
        String finalFileName;
        if (basePath != null) {
            char firstChar = fileName.charAt(0);
            if (firstChar == '/' || firstChar == '\\') {
                finalFileName = basePath + fileName;
            } else {
                finalFileName = basePath + "/" + fileName;
            }
        } else {
            finalFileName = fileName;
        }

        if (finalFileName.charAt(0) == '/') {
            finalFileName = finalFileName.substring(1);
        }

        return finalFileName;
    }

    /**
     * 是否存在
     *
     * @param fullName 完整路径
     * @return boolean
     */
    public static boolean exist(String fullName) {
        return getClassLoader().getResource(fullName) != null;
    }
}
