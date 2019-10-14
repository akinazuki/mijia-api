const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto');

module.exports = class {
    constructor(config) {
        if (!config.userId) {
            throw new Error(`userId not defined`)
        }
        if (!config.ssecurity) {
            throw new Error(`ssecurity not defined`)
        }
        if (!config.serviceToken) {
            throw new Error(`serviceToken not defined`)
        }
        if (!config.userAgent) {
            throw new Error(`userAgent not defined`)
        }
        if (!config.MAX_RETRY) {
            config.MAX_RETRY = 20;
        }
        this.config = config
    }
    generateNonce() {
        let buf = Buffer.alloc(12);
        let random_bytes = crypto.randomBytes(8);
        // let times = parseInt((new Date().getTime()) / (1000 * 60));
        let times = ((new Date().getTime() + 10000) / 60000).toFixed(0)
        // console.log(`Local Time`, times)

        random_bytes.forEach((byte, index) => {
            buf[index] = byte
        });
        buf.writeInt32BE(Buffer.from(times), 8);
        return Buffer.from(buf).toString('base64')
    }

    Sign(databytes, b64hash) {
        let secret = Buffer.from(b64hash, 'base64');
        let sha256_digest = crypto.createHmac('sha256', secret).update(databytes, 'utf8').digest('base64');
        return sha256_digest;
    }
    getSignature(url, ssecurity, params) {
        let nonce = this.generateNonce();
        let sha256_data = Buffer.concat([Buffer.from(ssecurity, 'base64'), Buffer.from(nonce, 'base64')]);
        let sha256_digest = crypto.createHash('sha256').update(sha256_data).digest();
        let b64hash = Buffer.from(sha256_digest).toString('base64');

        let build_str = [
            url, b64hash, nonce
        ].join("&");
        if (params) {
            build_str += `&data=${params}`
        }
        return {
            sign: this.Sign(build_str, b64hash),
            nonce,
            build_str
        }
    }
    fetchWithRetry(params) {
        return new Promise(async (resolve, reject) => {
            let sign = this.getSignature(params.target, params.ssecurity, params.data)
            let stringifyed_data = qs.stringify({
                _nonce: sign.nonce,
                data: params.data,
                signature: sign.sign,
            });
            axios.post(`https://api.io.mi.com/app${params.target}`, stringifyed_data, {
                headers: {
                    'X-XIAOMI-PROTOCAL-FLAG-CLI': 'PROTOCAL-HTTP2',
                    'User-Agent': params.userAgent,
                    'Cookie': `userId=${params.userId}; serviceToken=${params.serviceToken}; countryCode=CN; locale=en_US; timezone_id=Asia/Shanghai; timezone=GMT%2B08%3A00; is_daylight=0; dst_offset=0; channel=MI_APP_STORE`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then(res => {
                return resolve(res.data);
                //let server_time = (new Date(res.headers['date']).getTime() / 60000).toFixed(0)
                //console.log("Server Time", server_time)
                //console.log(res.data);
            }).catch(err => {
                return reject(err.response.data || err);
                //let server_time = (new Date(err.response.headers['date']).getTime() / 60000).toFixed(0)
                //console.log("Server Time", server_time)
                //console.log(err.response.data);
            })
        })
    }
    fetch(target, data_object) {
        return new Promise(async (resolve, reject) => {
            const AuthorizeInfo = this.config
            // const AuthorizeInfo = {
            //     userId: process.env.userId,
            //     ssecurity: process.env.ssecurity,
            //     serviceToken: process.env.serviceToken,
            //     userAgent: process.env.userAgent
            // }
            let { userId, serviceToken, ssecurity, userAgent } = AuthorizeInfo
            let data = JSON.stringify(data_object);
            let params = {
                target, ssecurity, data, userId, ssecurity, serviceToken, userAgent
            }
            let retry = 0;
            let max_retry = parseInt(process.env.MAX_RETRY);
            for (; ;) {
                let result = await this.fetchWithRetry(params).catch(err => {
                    retry++
                    console.log(`Mijia API Got Error, Retrying[${retry}]...`, err)
                })
                if (result) {
                    resolve(result)
                    break;
                }
                if (retry >= max_retry) {
                    reject({
                        error: 'MAX_RETRY',
                        auth: AuthorizeInfo
                    })
                    break;
                }
            }
        })
    }
}