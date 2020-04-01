package com.xiyoufang.aij.platform.dto;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * Created by 席有芳 on 2020-03-21.
 *
 * @author 席有芳
 */
@Data
@Accessors(chain = true)
public class LoginFormDTO {

    /**
     * 用户名
     */
    private String username;
    /**
     * 用户密码
     */
    private String password;

}
