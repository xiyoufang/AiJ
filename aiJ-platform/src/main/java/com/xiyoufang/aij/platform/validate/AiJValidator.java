package com.xiyoufang.aij.platform.validate;

import com.jfinal.core.Controller;
import com.jfinal.kit.Kv;
import com.jfinal.kit.Ret;
import com.jfinal.kit.StrKit;
import com.jfinal.validate.Validator;
import com.xiyoufang.aij.platform.config.ResponseStatusCode;

/**
 * Created by 席有芳 on 2020-03-26.
 *
 * @author 席有芳
 */
public abstract class AiJValidator extends Validator {

    /**
     *
     */
    private Kv kv = Kv.create();

    /**
     * Use validateXxx method to validate the parameters of this action.
     *
     * @param c c
     */
    @Override
    protected void validate(Controller c) {
        setRet(Ret.create());
        kv.set(ResponseStatusCode.CODE_KEY, ResponseStatusCode.REQUEST_VALIDATE_FAILURE);
        kv.set(ResponseStatusCode.DATA_KEY, getRet());
        aiJValidate(c);
    }

    /**
     * 校验String
     *
     * @param value        内容
     * @param minLen       最小
     * @param maxLen       最长
     * @param errorKey     error Key
     * @param errorMessage error Message
     */
    protected void validateStringValue(String value, int minLen, int maxLen, String errorKey, String errorMessage) {
        if (minLen > 0 && StrKit.isBlank(value)) {
            addError(errorKey, errorMessage);
            return;
        }
        if (value == null) {        // 支持 minLen <= 0 且 value == null 的情况
            value = "";
        }
        if (value.length() < minLen || value.length() > maxLen) {
            addError(errorKey, errorMessage);
        }
    }

    /**
     * aiJValidate
     *
     * @param c c
     */
    protected abstract void aiJValidate(Controller c);

    @Override
    protected void handleError(Controller c) {
        final Ret ret = getRet();
        StringBuilder sb = new StringBuilder();
        for (Object value : ret.values()) {
            sb.append(value.toString()).append("\n");
        }
        kv.set(ResponseStatusCode.MESSAGE_KEY, sb.toString());
        c.renderJson(kv);
    }

}
