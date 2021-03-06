import './env'
import Koa from 'koa'
import json from 'koa-json'
import logger from 'koa-logger'
import koaRouter from 'koa-router'
import koaBodyparser from 'koa-bodyparser'
import auth from './server/routes/auth.js'
import api from './server/routes/api.js'
import jwt from 'koa-jwt'

const app = new Koa()
const router = koaRouter()

let port = process.env.BACK_END_PORT

app.use(koaBodyparser())
app.use(json())
app.use(logger())

app.use(async function (ctx, next) {
    let start = new Date()
    await next()
    let ms = new Date() - start
    console.log('%s %s - %s', ctx.method, ctx.url, ms)
})

app.use(async function (ctx, next) {  //  如果JWT验证失败，返回验证失败信息
    try {
        await next()
    } catch (err) {
        if (err.status === 401) {
            ctx.status = 401
            ctx.body = {
                success: false,
                token: null,
                info: 'Protected resource, use Authorization header to get access'
            }
        } else {
            throw err
        }
    }
})

app.on('error', function (err, ctx) {
    console.log('server error', err)
})

router.use('/auth', auth.routes()) // 挂载到koa-router上，并且把所有请求加上'/auth'路径
router.use('/api', jwt({ secret: 'jwtsss' }), api.routes()) // 所有走/api/打头的请求都需要经过jwt验证。

app.use(router.routes()) // 将路由规则挂载到Koa上。

export default app.listen(port, () => {
    console.log(`Koa is listening in ${port}`)
})