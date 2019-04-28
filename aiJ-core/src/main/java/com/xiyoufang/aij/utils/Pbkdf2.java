package com.xiyoufang.aij.utils;

import org.apache.commons.codec.binary.Hex;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.security.spec.KeySpec;


/**
 * 类名称：PBKDF2
 * <p>
 * 修改备注：
 * <p>
 * 1.当增加一个用户的时候，调用generateSalt()生成盐，然后调用getEncryptedPassword(),同时存储盐和密文。
 * 再次强调，不要存储明文密码，不要存储明文密码，因为没必要！不要担心将盐和密文存储在同一张表中，上面已经说过了，这个无关紧要。
 * <p>
 * 2.当认证用户的时候，从数据库中取出盐和密文，将他们和明文密码同时传给authenticate()，根据返回结果判断是否认证成功。
 * <p>
 * 3.当用户修改密码的时候，仍然可以使用原来的盐，只需要调用getEncryptedPassword()方法重新生成密文就可以了。
 */
public class Pbkdf2 {

    /**
     * @param attemptedPassword attemptedPassword
     * @param encryptedPassword encryptedPassword
     * @param salt              salt
     * @return bool
     */
    public static boolean authenticate(String attemptedPassword, String encryptedPassword, String salt) {
        try {
            String encryptedAttemptedPassword = getEncryptedPassword(attemptedPassword, salt);
            return encryptedPassword.equals(encryptedAttemptedPassword);
        } catch (Exception e) {
            throw new RuntimeException("检验失败！");
        }

    }

    /**
     * @param password password
     * @param salt     salt
     * @return String
     */
    public static String getEncryptedPassword(String password, String salt) {
        String algorithm = "PBKDF2WithHmacSHA1";
        int derivedKeyLength = 160;
        int iterations = 20000;
        try {
            KeySpec spec = new PBEKeySpec(password.toCharArray(), Hex.decodeHex(salt.toCharArray()), iterations, derivedKeyLength);
            SecretKeyFactory f = SecretKeyFactory.getInstance(algorithm);
            return Hex.encodeHexString(f.generateSecret(spec).getEncoded());
        } catch (Exception e) {
            throw new RuntimeException("获取密码！");
        }

    }

    /**
     * 获取盐
     *
     * @return Salt
     */
    public static String generateSalt() {
        try {
            SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
            byte[] salt = new byte[8];
            random.nextBytes(salt);

            return Hex.encodeHexString(salt);
        } catch (Exception e) {
            throw new RuntimeException("获取盐失败！");
        }
    }

    /*
    public static void main(String[] args) {
        String salt = generateSalt();
        System.out.println(salt);
        String encryptedPassword = getEncryptedPassword("123456", salt);
        System.out.println(encryptedPassword);
        System.out.println(authenticate("123456",encryptedPassword,salt));
    }*/

}
