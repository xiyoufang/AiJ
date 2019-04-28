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
import com.jfinal.template.expr.ast.Expr;
import com.jfinal.template.expr.ast.ExprList;
import com.jfinal.template.stat.Scope;

import com.jfinal.template.io.Writer;
import com.xiyoufang.jfinal.shiro.kit.ArrayKit;


/**
 * 没有该角色
 * #shiroNotHasRole(roleName)
 * body
 * #end
 */
public class ShiroNotHasRoleDirective extends ShiroDirectiveBase {
    private Expr[] exprs;


    public void setExprList(ExprList exprList) {
        exprs = exprList.getExprArray();
    }


    public void exec(Env env, Scope scope, Writer writer) {
        boolean hasAnyRole = false;
        if (getSubject() != null && ArrayKit.isNotEmpty(exprs)) {
            for (Expr expr : exprs) {
                if (getSubject().hasRole(expr.toString())) {
                    hasAnyRole = true;
                    break;
                }
            }
        }
        if (!hasAnyRole)
            stat.exec(env, scope, writer);
    }

    public boolean hasEnd() {
        return true;
    }


}