/**
 * Copyright (c) 2015-2017, Michael Yang 杨福海 (fuhai999@gmail.com).
 * <p>
 * Licensed under the GNU Lesser General Public License (LGPL) ,Version 3.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.gnu.org/licenses/lgpl-3.0.txt
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.xiyoufang.jfinal.shiro.directives;

import com.jfinal.template.Env;
import com.jfinal.template.stat.Scope;

import com.jfinal.template.io.Writer;

/**
 * 用户已经身份验证通过，Subject.login登录成功
 * #shiroAuthenticated()
 * body
 * #end
 */
public class ShiroAuthenticatedDirective extends ShiroDirectiveBase {

    public void exec(Env env, Scope scope, Writer writer) {
        if (getSubject() != null && getSubject().isAuthenticated())
            stat.exec(env, scope, writer);
    }

    public boolean hasEnd() {
        return true;
    }
}