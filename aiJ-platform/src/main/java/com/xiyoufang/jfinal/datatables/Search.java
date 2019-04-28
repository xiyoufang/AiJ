package com.xiyoufang.jfinal.datatables;

import java.io.Serializable;

/**
 * 搜索
 * @author farmer
 *
 */
public class Search implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 6148764174606736934L;

	/**
	 * 正则
	 */
	private Boolean regex;
	
	/**
	 * 值
	 */
	private String value;

	public Boolean getRegex() {
		return regex;
	}

	public void setRegex(Boolean regex) {
		this.regex = regex;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

}