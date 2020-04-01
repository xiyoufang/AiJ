package com.xiyoufang.jfinal.servlet;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.util.Map;

/**
 * 参数去空格
 *
 * @author farmer
 */
public class TrimParameterHttpServletRequest extends HttpServletRequestWrapper {

    /**
     * 构造函数
     *
     * @param request request
     */
    public TrimParameterHttpServletRequest(HttpServletRequest request) {
        super(request);
    }

    /**
     * 获取参数
     */
    @Override
    public String getParameter(String name) {
        String parameter = super.getParameter(name);
        return parameter != null ? parameter.trim() : null;
    }

    /**
     * 获取参数
     */
    @Override
    public String[] getParameterValues(String name) {
        String[] values = super.getParameterValues(name);
        if (values != null) {
            for (int i = 0; i < values.length; i++) {
                values[i] = values[i].trim();
            }
        }
        return values;
    }

    /**
     * 获取参数Map
     */
    @Override
    public Map<String, String[]> getParameterMap() {
        Map<String, String[]> parameterMap = super.getParameterMap();
        for (Map.Entry<String, String[]> entry : parameterMap.entrySet()) {
            String[] values = entry.getValue();
            if (values != null) {
                for (int i = 0; i < values.length; i++) {
                    values[i] = values[i].trim();
                }
            }
        }
        return parameterMap;
    }

}
