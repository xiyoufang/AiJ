package com.xiyoufang.jfinal.datatables;

import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.BeanUtils;

public class DatatableInjector {

	/**
	 * 获取Datatable对象
	 * @param request request
	 * @return Datatable
	 */
	public static Datatable getDatatable(HttpServletRequest request){
		Datatable datatable = new Datatable();
		datatable.setDraw((Integer)ConvertUtils.convert(request.getParameter("draw"), Integer.class));
		datatable.setStart((Integer)ConvertUtils.convert(request.getParameter("start"), Integer.class));
		datatable.setLength((Integer)ConvertUtils.convert(request.getParameter("length"), Integer.class));
		datatable.setColumns(getColumns(request));
		datatable.setOrders(getOrders(request));
		datatable.setFilter(getFilter(request));
		datatable.setSearch(getSearch(request));
		return datatable;
	}
	
	/**
	 * 获取搜索
	 * @param request request
	 * @return Search
	 */
	public static Search getSearch(HttpServletRequest request){
		Search search = new Search();
		search.setRegex((Boolean)ConvertUtils.convert(request.getParameter("search[regex]"),Boolean.class));
		search.setValue(request.getParameter("search[value]"));
		return search;
	}
	
	/**
	 * 封装列
	 * @param request request
	 * @return Columns
	 */
	public static List<Column> getColumns(HttpServletRequest request){
		List<Column> columns = new ArrayList<Column>();
		Enumeration<String> parameterNames = request.getParameterNames();
		Map<Integer, Map<String, String>> parameterMap = new HashMap<Integer, Map<String, String>>();
		while (parameterNames.hasMoreElements()) {
			String parameterName = parameterNames.nextElement();
			if(parameterName.matches("^columns\\[\\d*].*$")){
				String parameter = request.getParameter(parameterName);
				int start = parameterName.indexOf("[")+1;
				int end = parameterName.indexOf("]");
				int key = (Integer) ConvertUtils.convert(parameterName.substring(start, end),Integer.class);
				Map<String, String> itemMap = parameterMap.get(key);
				if(itemMap == null){
					itemMap = new HashMap<String, String>();
					columns.add(new Column());
				}
				String name = parameterName.replaceAll("columns\\[\\d*]", "").replace("][", ".").replace("[", "").replace("]", "");
				itemMap.put(name, parameter);
				parameterMap.put(key, itemMap);
			}
			
		}
		for(Map.Entry<Integer, Map<String,String>> entry : parameterMap.entrySet()){
			Column column = columns.get(entry.getKey());
			column.setSearch(new Column.Search());
			try {
				Map<String, String> value = entry.getValue();
				BeanUtils.populate(column, value);
			} catch (Exception e) {
				throw new RuntimeException("bean注入异常",e);
			}
		}
		return columns;
	}
	
	/**
	 * 封装排序
	 * @param request request
	 * @return orders
	 */
	public static List<Order> getOrders(HttpServletRequest request){
		List<Order> orders = new ArrayList<Order>();
		Enumeration<String> parameterNames = request.getParameterNames();
		Map<Integer, Map<String, String>> parameterMap = new HashMap<Integer, Map<String, String>>();
		while (parameterNames.hasMoreElements()) {
			String parameterName = parameterNames.nextElement();
			if(parameterName.matches("^order\\[\\d*].*$")){
				String parameter = request.getParameter(parameterName);
				GetItems getItems = new GetItems(parameterMap, parameterName).invoke();
				int key = getItems.getKey();
				Map<String, String> itemMap = getItems.getItemMap();
				if(itemMap == null){
					itemMap = new HashMap<String, String>();
					orders.add(new Order());
				}
				String name = parameterName.replaceAll("order\\[\\d*]", "").replace("][", ".").replace("[", "").replace("]", "");
				itemMap.put(name, parameter);
				parameterMap.put(key, itemMap);
			}
			
		}
		for(Map.Entry<Integer, Map<String,String>> entry : parameterMap.entrySet()){
			Order order = orders.get(entry.getKey());
			try {
				Map<String, String> value = entry.getValue();
				BeanUtils.populate(order, value);
			} catch (Exception e) {
				throw new RuntimeException("bean注入异常",e);
			}
		}
		return orders;
	}

	/**
	 * 封装过滤条件
	 * @param request request
	 * @return Filter
	 */
	public static Filter getFilter(HttpServletRequest request){
		Filter filter = new Filter();
		Enumeration<String> parameterNames = request.getParameterNames();
		while (parameterNames.hasMoreElements()) {
			String parameterName = parameterNames.nextElement();
			if(parameterName.matches("^filter\\[.+]$")){
				String parameter = request.getParameter(parameterName);
				String name = parameterName.replaceAll("filter\\[", "").replace("][", ".").replace("[", "").replace("]", "");
				filter.put(name,parameter);
			}
			
		}
		return filter;
	}

	private static class GetItems {
		private Map<Integer, Map<String, String>> parameterMap;
		private String parameterName;
		private int key;
		private Map<String, String> itemMap;

		public GetItems(Map<Integer, Map<String, String>> parameterMap, String parameterName) {
			this.parameterMap = parameterMap;
			this.parameterName = parameterName;
		}

		public int getKey() {
			return key;
		}

		public Map<String, String> getItemMap() {
			return itemMap;
		}

		public GetItems invoke() {
			int start = parameterName.indexOf("[")+1;
			int end = parameterName.indexOf("]");
			key = (Integer) ConvertUtils.convert(parameterName.substring(start, end), Integer.class);
			itemMap = parameterMap.get(key);
			return this;
		}
	}
}