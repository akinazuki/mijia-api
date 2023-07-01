import zlib from 'zlib'

export class Cryptor {
  ssecurity: string
  PLAIN_BUFFER = Buffer.from('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==', 'base64')
  
  constructor(ssecurity: string) {
    this.ssecurity = ssecurity
  }
  generateNonce() {
    let buf = Buffer.alloc(12)
    buf.writeInt32BE(Math.floor(Date.now() / 60000))
    return buf
  }
  async sign(method: string, path: string, map: { [key: string]: string }, rc4Key: string) {
    if (!rc4Key) {
      throw new Error('ssecurity is not nullable');
    }
    const items = [] as string[];
    if (method) {
      items.push(method.toUpperCase());
    }
    if (path) {
      items.push(path);
    }
    if (map && Object.keys(map).length > 0) {
      const keys = Object.keys(map).sort();
      for (const key of keys) {
        items.push(`${key}=${map[key]}`);
      }
    }
    items.push(rc4Key);

    const message = items.join('&');
    return crypto.subtle.digest('SHA-1', Buffer.from(message)).then((hash) => {
      return Buffer.from(hash).toString('base64');
    });
  }
  async buildSign(path: string, data: any) {
    const nonce = this.generateNonce()
    const key = await this.getRC4Key(nonce)
    const query = {
      data: JSON.stringify(data),
    }
    query["rc4_hash__"] = await this.sign('POST', path, query, key.toString('base64'))
    const streamendEncrypt = await this.streamendEncrypt(nonce)

    for (const key of Object.keys(query)) {
      const value = query[key]
      const encrypted = streamendEncrypt.encryptDecrypt(Buffer.from(value))
      query[key] = encrypted.toString('base64')
    }

    query["signature"] = await this.sign('POST', path, query, key.toString('base64'))
    query["_nonce"] = nonce.toString('base64')
    // query["ssecurity"] = this.ssecurity
    return {
      query,
      nonce,
      key,
    }
  }
  async getRC4Key(nonceBuffer?: Buffer) {
    if (!nonceBuffer) {
      nonceBuffer = this.generateNonce()
    }
    const ssecurityBuffer = Buffer.from(this.ssecurity, 'base64')
    const mergeArray = Buffer.concat([ssecurityBuffer, nonceBuffer])

    return crypto.subtle.digest('SHA-256', mergeArray).then((hash) => {
      return Buffer.from(hash)
    })
  }
  async streamendEncrypt(nonceBuffer?: Buffer) {
    const rc4Key = await this.getRC4Key(nonceBuffer)
    const rc4e = new RC4Encryption(rc4Key)
    rc4e.encryptDecrypt(this.PLAIN_BUFFER)
    return rc4e
  }
  async encryptRequest(body, nonceBuffer?: Buffer): Promise<string> {
    const rc4Key = await this.getRC4Key(nonceBuffer)
    const rc4e = new RC4Encryption(rc4Key)
    rc4e.encryptDecrypt(this.PLAIN_BUFFER)
    const cryptedData_raw = Buffer.from(body)
    const decryptedData = rc4e.encryptDecrypt(cryptedData_raw)
    return decryptedData.toString('base64')
  }
  async decryptRequest(body, nonceBuffer?: Buffer): Promise<string> {
    const rc4Key = await this.getRC4Key(nonceBuffer)
    const rc4e = new RC4Encryption(rc4Key)
    rc4e.encryptDecrypt(this.PLAIN_BUFFER)
    const cryptedData_raw = Buffer.from(body, 'base64')
    const decryptedData = rc4e.encryptDecrypt(cryptedData_raw)
    return decryptedData.toString()
  }
  async decryptResponse(body, nonceBuffer?: Buffer): Promise<string> {
    const rc4Key = await this.getRC4Key(nonceBuffer)
    const rc4e = new RC4Encryption(rc4Key)
    rc4e.encryptDecrypt(this.PLAIN_BUFFER)
    const cryptedData_raw = Buffer.from(body, 'base64')
    const decryptedData = rc4e.encryptDecrypt(cryptedData_raw)
    try {
      return zlib.gunzipSync(decryptedData).toString()
    }
    catch (e) {
      return decryptedData.toString()
    }
  }
}


export class RC4Encryption {
  s_box: Buffer
  i: number
  j: any
  constructor(rc4Key) {
    this.s_box = Buffer.alloc(256);
    const length = rc4Key.length;
    for (let i = 0; i < 256; i++) {
      this.s_box[i] = i;
    }
    let i2 = 0;
    for (let i3 = 0; i3 < 256; i3++) {
      const i4 = i2 + rc4Key[i3 % length];
      const bArr = this.s_box;
      i2 = (i4 + bArr[i3]) & 255;
      const b = bArr[i3];
      bArr[i3] = bArr[i2];
      bArr[i2] = b;
    }
    this.i = 0;
    this.j = 0;
  }

  encryptDecrypt(bArr) {
    for (let i = 0; i < bArr.length; i++) {
      const b = bArr[i];
      const i2 = (this.i + 1) & 255;
      this.i = i2;
      const i3 = this.j;
      const bArr2 = this.s_box;
      const i4 = (i3 + bArr2[i2]) & 255;
      this.j = i4;
      const b2 = bArr2[i2];
      bArr2[i2] = bArr2[i4];
      bArr2[i4] = b2;
      bArr[i] = b ^ bArr2[(bArr2[i2] + bArr2[i4]) & 255];
    }
    return bArr;
  }
}