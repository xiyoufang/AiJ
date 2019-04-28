package com.xiyoufang.jfinal.directive;

import com.jfinal.template.Directive;
import com.jfinal.template.Env;
import com.jfinal.template.TemplateException;
import com.jfinal.template.io.Writer;
import com.jfinal.template.stat.Scope;

import java.io.IOException;

/**
 * Created by 席有芳 on 2018-12-31.
 *
 * @author 席有芳
 */
public class VersionDirective extends Directive {

    public static String version = "1.0.1";

    public void exec(Env env, Scope scope, Writer writer) {
        try {
            writer.write(version);
        } catch (IOException e) {
            throw new TemplateException(e.getMessage(), location, e);
        }
    }
}
