package com.xiyoufang.jfinal.datatables;

import com.jfinal.plugin.activerecord.Page;
import com.jfinal.plugin.activerecord.Record;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class DatatableUtils {


    /**
     * 获取 getDataTableRender
     *
     * @param page page
     * @param draw draw
     * @return Map
     */
    public static Map<String, Object> getDataTableRender(Page page, int draw) {
        return getDataTableRender(page, draw, Object.class);
    }

    /**
     * 获取 getDataTableRender
     *
     * @param page page
     * @param draw draw
     * @param cls  cls
     * @return Map
     */
    public static Map<String, Object> getDataTableRender(Page page, int draw, Class cls) {
        Map<String, Object> resultMap = new HashMap<String, Object>();
        resultMap.put("recordsTotal", page.getTotalRow());
        resultMap.put("recordsFiltered", page.getTotalRow());
        resultMap.put("draw", draw);
        if (Record.class == cls) {
            List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
            for (Object record : page.getList()) {
                data.add(((Record) record).getColumns());
            }
            resultMap.put("data", data);
        } else {
            resultMap.put("data", page.getList());
        }
        return resultMap;
    }

    /**
     * 获取总页码
     * @param totalRow totalRow
     * @param pageSize pageSize
     * @return totalPage
     */
    public static int totalPage(int totalRow, int pageSize) {
        int totalPage = (totalRow / pageSize);
        if (totalRow % pageSize != 0) {
            totalPage++;
        }
        return totalPage;
    }

}
