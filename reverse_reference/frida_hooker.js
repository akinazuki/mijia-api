let ignore_path = [
  "/v2/statv2/stat_info"
]
function hookSignature() {
  let signer = Java.use("_m_j.cy9");
  let RC4Encryption = Java.use("_m_j.dy9");
  signer["OooO0O0"].implementation = function (method, path, map, rc4Key) {
    let needLog = map.containsKey("rc4_hash__");
    if (!needLog && !ignore_path.includes(path)) {
      console.log(`Invoke Signature:  ${method} ${path}`)
      let keySet = map.keySet();
      let keysetSize = keySet.size();
      for (let i = 0; i < keysetSize; i++) {
        let key = keySet.toArray()[i];
        let value = map.get(key);
        console.log(`key: ${key}, value: ${value}`)
      }
      let result = this["OooO0O0"](method, path, map, rc4Key);
      console.log(`Invoke Signature result: ${result}`)

      console.log('\n\n\n\n')
      return result;
    } else {
      let result = this["OooO0O0"](method, path, map, rc4Key);
      return result;
    }
  };
  // signer["OooO00o"].implementation = function (j) {
  //   console.log(`signer.rand is called: j=${j}`);
  //   let result = this["OooO00o"](j);
  //   console.log(`signer.rand result=${result}`);
  //   return result;
  // };

  // RC4Encryption["$init"].implementation = function (rc4Key) {
  //   console.log(`RC4Encryption.$init is called: rc4Key=${rc4Key}`);
  //   this["$init"](rc4Key);
  // };
  // RC4Encryption["OooO00o"].implementation = function (bArr) {
  //   console.log(`RC4Encryption.encryptDecrypt is called: data=${bArr}`);
  //   this["OooO00o"](bArr);
  //   console.log(`RC4Encryption.encryptDecrypt result=${bArr}\n`);
  // };
}

function encodeBase64(array) {
  let base64 = Java.use("_m_j.by9");
  return base64["OooO0oO"](array, 0, array.length, 8);
}
function calculateSha256Hash(array) {
  let Version = Java.use("com.xiaomi.smarthome.library.common.util.Version");
  return Version["o0000OOo"](array)
}

function operation(array) {
  let Version = Java.use("com.xiaomi.smarthome.library.common.util.Version");
  return Version["Oooo0"](array)
}

function hookRC4Encryption() {
  let RC4Encryption = Java.use("_m_j.dy9");
  RC4Encryption["$init"].implementation = function (rc4Key) {
    this["$init"](rc4Key);
    console.log(`RC4Encryption[${this}].$init is called: rc4Key=${encodeBase64(rc4Key)}`);
  };

  RC4Encryption["OooO00o"].implementation = function (bArr) {
    console.log(`RC4Encryption[${this}].encryptDecrypt is called: i=${this._OooO00o.value}, j=${this.OooO0O0.value} data=${encodeBase64(bArr)}`);
    this["OooO00o"](bArr);
    console.log(`RC4Encryption[${this}].encryptDecrypt i=${this._OooO00o.value}, j=${this.OooO0O0.value} result=${encodeBase64(bArr)}\n`);
  };
}
function hookRC4DropCoder() {
  let RC4DropCoder = Java.use("_m_j.ey9");
  RC4DropCoder["$init"].overload('[B').implementation = function (rc4Key) {
    console.log(`RC4DropCoder.$init is called: rc4Key=${encodeBase64(rc4Key)}`);
    this["$init"](rc4Key);
  };
  //   RC4DropCoder["OooO0OO"].implementation = function (str) {
  //     const RC4EncryptionPtr = this["_OooO0O0"].value;
  //     let result = this["OooO0OO"](str);
  //     console.log(`
  // RC4DropCoder[${this}].encrypt is called: str=${str}
  //       - RC4EncryptionPointer: ${RC4EncryptionPtr}
  //       - Result: ${result}\n\n
  // `);
  //     return result;
  //   };
  //   RC4DropCoder["OooO0O0"].implementation = function (bArr) {
  //     const RC4EncryptionPtr = this["_OooO0O0"].value;
  //     let result = this["OooO0O0"](bArr);
  //     console.log(`
  // RC4DropCoder[${this}].decrypt is called: bArr=${bArr}
  //       - RC4EncryptionPointer: ${RC4EncryptionPtr}
  //       - Result: ${result}\n\n
  // `);
  //     return result;
  //   };
  RC4DropCoder["OooO00o"].implementation = function (useCipher, input) {
    const RC4EncryptionPtr = this["_OooO0O0"].value;
    let result = this["OooO00o"](useCipher, input);
    //     console.log(`
    // RC4DropCoder[${this}].processInput is called: useCipher=${useCipher}, input=${input}\n
    //       - RC4EncryptionPointer: ${RC4EncryptionPtr}
    //       - Result: ${result}\n\n
    // `);
    console.log(`
RC4DropCoder[${this}].processInput is called: useCipher=${useCipher}\n
      - RC4EncryptionPointer: ${RC4EncryptionPtr}
      - Result: ${result}\n\n
`);
    return result;
  };
}
function bufferToString(buffer) {
  return String.fromCharCode.apply(null, new Uint16Array(buffer));
}

function hookMergeArray() {
  let requestor = Java.use("_m_j.vq6");
  let logged = false;
  requestor["OooO0OO"].implementation = function (ssecurity, randnonce) {
    let result = this["OooO0OO"](ssecurity, randnonce);
    if (!logged) {
      console.log(`requestor.mergeArray is called: ssecurity=${encodeBase64(ssecurity)}, randnonce=${encodeBase64(randnonce)}`);
      let calculated_hash = calculateSha256Hash(result)
      console.log(`requestor.mergeArray rc4Key=${encodeBase64(calculated_hash)}`);
    }
    // logged = true;
    return result;
  };
}
function hookMiServiceTokenInfo() {
  let MiServiceTokenInfo = Java.use("com.xiaomi.youpin.login.entity.account.MiServiceTokenInfo");
  MiServiceTokenInfo["OooO00o"].implementation = function (str) {
    console.log(`MiServiceTokenInfo.getObject is called: str=${str}`);
    let result = this["OooO00o"](str);
    console.log(`MiServiceTokenInfo.getObject result=${result}`);
    return result;
  };
}
function hookReq() {
  let Builder = Java.use("okhttp3.Request$Builder");
  //   Builder["post"].implementation = function (requestBody) {
  //     let Buffer = Java.use("_m_j.a3f");
  //     let buffer = Buffer.$new();
  //     requestBody.writeTo(buffer)
  //     let url = this._url.value
  //     let result = this["post"](requestBody);
  //     let kv = this._headers.value.namesAndValues.value
  //     let header_size = kv.size()
  //     let header = {}
  //     for (let i = 0; i < header_size; i++) {
  //       if (i % 2 == 0) {
  //         header[kv.get(i)] = kv.get(i + 1)
  //       }
  //     }
  //     console.log(`
  // ================================================================================

  // Network.post[ ${url} ]
  //   - Headers: 
  // ${Object.keys(header).map((key) => {
  //       return `        ${key}: ${header[key]}`
  //     }).join('\n')
  //       }
  // \n - RequestBody:\n\n${buffer.OoooO0O()}\n
  // ================================================================================`);
  //     return result;
  //   };
  let networkReqCallback = Java.use("_m_j.vq6$OooO0O0");
  networkReqCallback["onResponse"].implementation = function (call, response) {
    this["onResponse"](call, response);

    let Buffer = Java.use("_m_j.a3f");
    let buffer = Buffer.$new();
    // let body_string = response.body().string()

    let requestBody = response._request.value._body.value
    requestBody.writeTo(buffer)

    let kv = response._request.value._headers.value.namesAndValues.value
    let header = {}
    for (let i = 0; i < kv.length; i++) {
      if (i % 2 == 0) {
        header[kv[i]] = kv[i + 1]
      }
    }
    //     console.log(`
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Request Completed>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    //     Request URL: ${response._request.value._url.value}
    //     Request Headers:\n${Object.keys(header).map((key) => {
    //       return `      ${key}: ${header[key]}`
    //     }).join('\n')}

    //     Request Body:
    // ${buffer.OoooO0O()}

    //     Response:

    // ${body_string}

    // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // `);
    let url = response._request.value._url.value.toString()
    let need_ignore = false
    
    for (let i = 0; i < ignore_path.length; i++) {
      if (url.endsWith(ignore_path[i])) {
        need_ignore = true
        break
      }
    }


    if (!need_ignore) {
      console.log(`
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Request Completed>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    Request URL: ${response._request.value._url.value}
    Request Headers:\n${Object.keys(header).map((key) => {
        return `      ${key}: ${header[key]}`
      }).join('\n')}

    Request Body:
${buffer.OoooO0O()}


`);
    };
  }
}
function main() {
  Java.deoptimizeEverything();
  Java.perform(function () {
    hookSignature();
    hookMergeArray();
    hookRC4DropCoder();
    // hookRC4Encryption();
    // hookMiServiceTokenInfo();
    hookReq();
    console.log("Performing frida")
  });
}
setImmediate(main);