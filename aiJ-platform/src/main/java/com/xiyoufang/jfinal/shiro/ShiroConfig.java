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
package com.xiyoufang.jfinal.shiro;

import com.jfinal.template.Engine;
import com.xiyoufang.jfinal.shiro.directives.*;

public class ShiroConfig {

    /**
     * 配置模板指令
     *
     * @param engine engine
     */
    public static void configEngineDirective(Engine engine) {
        engine.addDirective("shiroAuthenticated", ShiroAuthenticatedDirective.class);
        engine.addDirective("shiroGuest", ShiroGuestDirective.class);
        engine.addDirective("shiroHasAllPermission", ShiroHasAllPermissionDirective.class);
        engine.addDirective("shiroHasAllRoles", ShiroHasAllRolesDirective.class);
        engine.addDirective("shiroHasAnyPermission", ShiroHasAnyPermissionDirective.class);
        engine.addDirective("shiroHasAnyRoles", ShiroHasAnyRolesDirective.class);
        engine.addDirective("shiroHasPermission", ShiroHasPermissionDirective.class);
        engine.addDirective("shiroHasRole", ShiroHasRoleDirective.class);
        engine.addDirective("shiroNoAuthenticated", ShiroNoAuthenticatedDirective.class);
        engine.addDirective("shiroNotHasPermission", ShiroNotHasPermissionDirective.class);
        engine.addDirective("shiroNotHasRole", ShiroNotHasRoleDirective.class);
        engine.addDirective("shiroPrincipal", ShiroPrincipalDirective.class);
    }

    private ShiroConfig() {
    }

}



