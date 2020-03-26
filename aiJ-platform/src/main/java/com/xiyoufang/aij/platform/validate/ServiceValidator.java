package com.xiyoufang.aij.platform.validate;

import com.jfinal.core.Controller;
import com.jfinal.plugin.activerecord.Record;
import com.xiyoufang.aij.core.ServiceType;
import com.xiyoufang.aij.platform.dto.ServiceDTO;
import com.xiyoufang.aij.platform.service.ServiceService;

/**
 * Created by 席有芳 on 2020-03-26.
 *
 * @author 席有芳
 */
public class ServiceValidator extends AiJValidator {
    /**
     * aiJValidate
     *
     * @param c c
     */
    @Override
    protected void aiJValidate(Controller c) {
        String actionKey = invocation.getMethodName();
        ServiceDTO arg = (ServiceDTO) invocation.getArg(0);
        switch (actionKey) {
            case "create":
                Record byCode = ServiceService.me.findByCode(arg.getCode());
                if (byCode != null) {
                    addError("service.code", "服务Code已经存在");
                }
                commonValidate(arg);
                break;
            case "update":
                Record byId = ServiceService.me.findById(arg.getId());
                if (byId == null) {
                    addError("service.id", "记录不存在，无法修改");
                    return;
                }
                byCode = ServiceService.me.findByCode(arg.getCode());
                if (byCode != null && !byCode.getInt("id").equals(arg.getId())) {
                    addError("service.code", "服务Code已经存在");
                }
                commonValidate(arg);
                break;
            case "delete":
                break;
            default:
        }
    }

    /**
     * 公共交易
     *
     * @param arg arg
     */
    private void commonValidate(ServiceDTO arg) {
        if (ServiceType.ROOM != arg.getType()) {
            addError("service.type", "只允许添加『ROOM』类型的服务");
        }
        validateStringValue(arg.getName(), 2, 32, "service.name", "服务名称长度范围为[2-32]");
        validateStringValue(arg.getDescription(), 2, 128, "service.description", "服务描述长度范围为[2-128]");
    }

}
