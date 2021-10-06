import aesjs from 'aes-js';
import pbkdf2 from 'pbkdf2';
import md5 from 'md5';

/**
 * Returns the AES-256 encryption key to be used derived
 * from each user's wallet private key
 */
const generatePrivateKey = (plaintextKey) => {
  // convert plaintext key to MD5 so it's always 32 chars
  const hashedKey = md5(plaintextKey);
  return pbkdf2.pbkdf2Sync(hashedKey, 'salt', 1, 256 / 8, 'sha512');
};

export default class AESHelper {

  static encrypt(text, secret) {
    const key = generatePrivateKey(secret);
    const textBytes = aesjs.utils.utf8.toBytes(text);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key);
    const encryptedBytes = aesCtr.encrypt(textBytes);
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    return encryptedHex;
  }

  static decrypt(encryptedText, secret) {
    const encryptedBytes = aesjs.utils.hex.toBytes(encryptedText);
    const key = generatePrivateKey(secret);
    const aesCtr = new aesjs.ModeOfOperation.ctr(key);
    const decryptedBytes = aesCtr.decrypt(encryptedBytes);
    const decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText;
  }
}
