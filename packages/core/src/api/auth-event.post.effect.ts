import { HttpError, HttpStatus, EffectFactory, use } from '@marblejs/core'
import { throwError, of, from } from 'rxjs'
import { mergeMap, mapTo, catchError } from 'rxjs/operators'
import { validator$, Joi } from '@yeongjet/middleware-joi'
import { RedisClient } from '@mazongguan-common/client'

const validator = validator$({
    body: Joi.object({
        AppId: Joi.string().min(1).required(),
        CreateTime: Joi.number().integer().min(1).required(),
        InfoType: Joi.string().valid('component_verify_ticket').required(),
        ComponentVerifyTicket: Joi.string().min(1).required()
    })
})

const { xml: { Encrypt: stringEncrypted} } : {
    xml:{
        Encrypt: string
    }
} = await xml2js.parseStringPromise(XMLEncrypted, {explicitArray: false})
const md = forge.md.sha1.create();
md.update([AppParam.token, URLParam.nonce, URLParam.timestamp, stringEncrypted].sort().join(''), 'utf8')
if(md.digest().toHex() !== URLParam.msg_signature) {
    console.log('签名不正确')
} else {
    console.log('签名正确')
}
const bufferEncrypted = forge.util.createBuffer(forge.util.decode64(stringEncrypted), 'raw')
const AESKey = forge.util.decode64(`${AppParam.encodingAESKey}=`)
const decipher = forge.cipher.createDecipher('AES-CBC', AESKey)
decipher.start({iv: AESKey.substr(0, 16)})
decipher.update(bufferEncrypted);
decipher.finish()
const hexStringDecrypted = decipher.output.toHex()
const randomNumber = parseInt(hexStringDecrypted.substr(0, 16 * 8 / 4), 16)
const xmlLength = parseInt(hexStringDecrypted.substr(16 * 8 / 4, 4 * 8 / 4), 16)
const xmlContent = forge.util.hexToBytes(hexStringDecrypted.substr(20 * 8 / 4, xmlLength * 2))
const appid = forge.util.hexToBytes(hexStringDecrypted.substr(20 * 8 / 4 + xmlLength * 2))
if(appid !== AppParam.appid){
    console.log('appid不匹配')
}else{
    console.log('appid匹配')
}

export const createBatch$ = EffectFactory.matchPath('wechat-third/auth-event')
    .matchType('POST')
    .use(req$ =>
        req$.pipe(
            use(validator),
            mergeMap(req =>
                RedisClient.getInstance().set('mazongguan:service:wechat:component_verify_ticket', req.body.ComponentVerifyTicket)
            ),
            mapTo({ body: { code: 10000, message: 'ok' } }),
            catchError(() => throwError(
                new HttpError('User does not exist', HttpStatus.NOT_FOUND)
            ))
        )
    )
