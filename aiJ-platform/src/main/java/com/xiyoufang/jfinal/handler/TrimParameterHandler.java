package com.xiyoufang.jfinal.handler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.jfinal.handler.Handler;
import com.xiyoufang.jfinal.servlet.TrimParameterHttpServletRequest;

/**
 * 清除参数Handler
 * @author farmer
 *
 */
public class TrimParameterHandler extends Handler{

	@Override
	public void handle(String target, HttpServletRequest request, HttpServletResponse response, boolean[] isHandled) {
		next.handle(target, new TrimParameterHttpServletRequest(request), response, isHandled);
	}

}
