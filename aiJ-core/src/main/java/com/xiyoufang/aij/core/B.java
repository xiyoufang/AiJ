package com.xiyoufang.aij.core;

/**
 * Created by 席有芳 on 2018-12-20.
 *
 * @author 席有芳
 */
public class B<O> {

    /**
     * true / false
     */
    public boolean b;
    /**
     * message
     */
    public O m;

    public B(boolean b) {
        this.b = b;
    }

    public B(boolean b, O m) {
        this.b = b;
        this.m = m;
    }

    public static B b(boolean b) {
        return new B(b);
    }

    public static <O> B b(boolean b, O m) {
        return new B<>(b, m);
    }
}
