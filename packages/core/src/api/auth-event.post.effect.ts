import { HttpError, HttpStatus, EffectFactory, use } from '@marblejs/core'
import { throwError, of, from } from 'rxjs'
import { mergeMap, map, catchError } from 'rxjs/operators'
import { validator$, Joi } from '@yeongjet/middleware-joi'


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
                of(req.body).pipe(
                    mergeMap(batch =>
                        from(

                        )
                    ),
                    mergeMap(neverNullable),
                    map(batch => ({
                        body: {
                            code: 10000,
                            data: {
                                batch: batch
                            }
                        }
                    })),
                    catchError(error =>
                        throwError(
                            new HttpError(
                                `Consumer create fail: ${error}`,
                                HttpStatus.INTERNAL_SERVER_ERROR
                            )
                        )
                    )
                )
            )
        )
    )
