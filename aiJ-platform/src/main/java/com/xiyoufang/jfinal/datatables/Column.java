package com.xiyoufang.jfinal.datatables;

import java.io.Serializable;

/**
 * 列
 * @author farmer
 *
 */
public class Column implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -2389465198723675396L;

	/**
	 * 
	 * @author farmer
	 *
	 */
	public static class Search {

		private Boolean regex;

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

	private String name;

	private String data;

	private Boolean orderable;

	private Search search;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	public Boolean getOrderable() {
		return orderable;
	}

	public void setOrderable(Boolean orderable) {
		this.orderable = orderable;
	}

	public Search getSearch() {
		return search;
	}

	public void setSearch(Search search) {
		this.search = search;
	}

}
