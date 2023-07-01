import Fastify from 'fastify'
import { Cryptor } from './mijia'
const fastify = Fastify({
  logger: true
})

const COOKIE = `YOUR_MIJIA_COOKIE`
const SSECURITY = '1145141919810'

fastify.post('/*', async (request, reply) => {
  console.log(request.url)
  const type = request?.query?.["type"] || 'normal' // normal or bussiness
  const ssecurity = request?.query?.["ssecurity"] || SSECURITY

  const mijiacrypt = new Cryptor(ssecurity)

  const req = await mijiacrypt.buildSign(request.url, request.body)

  const bussiness_host = `https://business.smartcamera.api.io.mi.com`
  const nornam_host = `https://api.io.mi.com/app`
  const data = await fetch(`${type === "normal" ? nornam_host : bussiness_host}${request.url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'iOS-16.5-8.4.201-iPhone15,3',

      'X-XIAOMI-PROTOCAL-FLAG-CLI': 'PROTOCAL-HTTP2',
      'MIOT-ENCRYPT-ALGORITHM': 'ENCRYPT-RC4',
      'Accept-Encoding': 'identity',
      'Cookie': COOKIE,
    },
    body: new URLSearchParams(req.query).toString()
  }).then(res => res.text()).then(data => mijiacrypt.decryptResponse(data, req.nonce))
  reply.send(data)
})

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
})