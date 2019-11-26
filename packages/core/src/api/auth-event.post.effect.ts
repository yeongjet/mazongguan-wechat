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
