package com.xiyoufang.aij.timer;

import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * Created by 席有芳 on 2018-12-30.
 * 按照固定频率的环形定时任务，执行堵塞时的策略为丢弃
 *
 * @author 席有芳
 */
public class TimerSchedule {

    /**
     * 任务
     */
    private Map<Task, Time> tasks = new HashMap<>();
    /**
     * 执行的线程池
     */
    private Executor executor;

    /**
     * 计时
     */
    private static class Time {
        int period;
        long currentTime;
        long count;

        Time(int period, long currentTime, long count) {
            this.period = period;
            this.currentTime = currentTime;
            this.count = count;
        }
    }

    /**
     * 构造函数
     */
    public TimerSchedule() {
        executor = new ThreadPoolExecutor(4, 16, 10, TimeUnit.SECONDS, new ArrayBlockingQueue<Runnable>(32), new ThreadPoolExecutor.DiscardPolicy());
    }

    /**
     * 添加一个任务
     *
     * @param task   task
     * @param period 频率
     */
    public void add(Task task, int period) {
        if (period < 1000) {
            throw new RuntimeException("执行频率不允许小于1秒!");
        }
        tasks.put(task, new Time(period, System.currentTimeMillis(), 0));
    }

    /**
     * 开始执行
     */
    public void start() {
        new Timer().schedule(new java.util.TimerTask() {
            @Override
            public void run() {
                for (final Map.Entry<Task, Time> taskTimeEntry : tasks.entrySet()) {
                    final Task task = taskTimeEntry.getKey();
                    final Time time = taskTimeEntry.getValue();
                    if (System.currentTimeMillis() - time.currentTime >= time.period) {
                        time.currentTime = System.currentTimeMillis();
                        time.count++;
                        executor.execute(new Runnable() {
                            @Override
                            public void run() {
                                task.run();
                            }
                        });
                    }
                }
            }
        }, 0, 100);
    }
}
