package com.xiyoufang.jfinal.datatables;

import java.io.Serializable;

/**
 * 排序
 * @author farmer
 *
 */
public class Order implements Serializable{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1729280765854759063L;
	
	/**
	 * 列号
	 */
	private Integer column;
	
	/**
	 * desc \ asc
	 */
	private String dir;

	public Integer getColumn() {
		return column;
	}

	public void setColumn(Integer column) {
		this.column = column;
	}

	public String getDir() {
		return dir;
	}

	public void setDir(String dir) {
		this.dir = dir;
	}
	
}
