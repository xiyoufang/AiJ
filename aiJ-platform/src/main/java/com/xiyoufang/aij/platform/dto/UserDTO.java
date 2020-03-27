package com.xiyoufang.aij.platform.dto;

import lombok.Data;
import lombok.experimental.Accessors;

/**
 * Created by 席有芳 on 2020-03-26.
 *
 * @author 席有芳
 */
@Data
@Accessors(chain = true)
public class UserDTO {
    /**
     * ID
     */
    private Integer id;
    /**
     * 用户状态
     */
    private Integer status;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
