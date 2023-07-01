## Mijia API

Based on Google Play MiHome Android 8.5.704

### 1. Requirements

- Mijia ssecurity params, Example: `VM/n*********A==`
- request cookie over api.io.mi.com

#### Cookie Example

```
PassportDeviceId=BCA6D**********; locale=zh_CN; serviceToken=Qqfpmz************************************bkc7C50=; userId=26******51; yetAnotherServiceToken=Qqfpmz************************************bkc7C50=
```

### 2. Usage

#### 2.1. Replace the `COOKIE` and `SSECURITY` params in `proxy.ts`

#### 2.2. Run the proxy server

```bash
$ pnpm i
$ pnpm dev
```

#### 2.3. Example

```bash
$ curl --location 'http://127.0.0.1:3000/homeroom/gethome' \
--header 'Content-Type: application/json' \
--data '{
    "limit": 300
}'
```

![image.png](https://vip2.loli.io/2023/07/01/jTgzmtG26P5wcLR.png)
