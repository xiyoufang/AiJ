package com.xiyoufang.jfinal.datatables;

import java.io.Serializable;
import java.util.List;

/**
 * 表格
 * 
 * @author farmer
 *
 */
public class Datatable implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -4590688555356209178L;

	/**
	 * 绘制次数
	 */
	private Integer draw;
	/**
	 * 开始条
	 */
	private Integer start;
	/**
	 * 获取条数
	 */
	private Integer length;
	/**
	 * 列
	 */
	private List<Column> columns;
	/**
	 * 排序
	 */
	private List<Order> orders;
	
	/**
	 * 过滤
	 */
	private Filter filter;
	
	/**
	 * 搜索
	 */
	private Search search;

	
	/**
	 * 计算当前页
	 * @return page
	 */
	public Integer getPage(){
		return (int) (Math.ceil(((double)this.start/(double)this.length)+1));
	}
	
	public Integer getDraw() {
		return draw;
	}

	public void setDraw(Integer draw) {
		this.draw = draw;
	}

	public Integer getStart() {
		return start;
	}

	public void setStart(Integer start) {
		this.start = start;
	}

	public Integer getLength() {
		return length;
	}

	public void setLength(Integer length) {
		this.length = length;
	}

	public List<Column> getColumns() {
		return columns;
	}

	public void setColumns(List<Column> columns) {
		this.columns = columns;
	}

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
	}

	public Search getSearch() {
		return search;
	}

	public void setSearch(Search search) {
		this.search = search;
	}

	public Filter getFilter() {
		return filter;
	}

	public void setFilter(Filter filter) {
		this.filter = filter;
	}
	
	
}
