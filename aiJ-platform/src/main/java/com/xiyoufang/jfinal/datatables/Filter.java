package com.xiyoufang.jfinal.datatables;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * 过滤
 * @author farmer
 *
 */
public class Filter implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = -6752058181757290528L;

	/**
	 * 过滤条件
	 */
	private Map<String, String> filterMap = new HashMap<String, String>();

	/**
	 * put数据
	 * @param key key
	 * @param value value
	 */
	public void put(String key ,String value){
		getFilterMap().put(key, value);
	}
	
	/**
	 * 获取Key
	 * @param key key
	 * @return string
	 */
	public String get(String key){
		return getFilterMap().get(key);
	}

	public Map<String, String> getFilterMap() {
		return filterMap;
	}

	public void setFilterMap(Map<String, String> filterMap) {
		this.filterMap = filterMap;
	}
	
}
