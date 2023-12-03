const CryptoJS = require('crypto-js');

function encryptTextWithKey(text, ke) {
    const key = CryptoJS.enc.Utf8.parse(ke)
    const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: key,
        mode: CryptoJS.mode.ECB
      });
      const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Base64).toString();
      return ciphertext;

}

export default encryptTextWithKey;
