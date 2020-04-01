package com.xiyoufang.aij.platform.dto;

import com.xiyoufang.aij.core.ServiceType;
import lombok.Data;
import lombok.experimental.Accessors;

/**
 * Created by 席有芳 on 2020-03-26.
 *
 * @author 席有芳
 */
@Data
@Accessors(chain = true)
public class ServiceDTO {
    /**
     * ID
     */
    private Integer id;
    /**
     * 服务类型
     */
    private ServiceType type;
    /**
     * 服务CODE
     */
    private String code;
    /**
     * 名称
     */
    private String name;
    /**
     * 描述
     */
    private String description;
}
