import { Application, Router } from "https://deno.land/x/oak/mod.ts"

const port = 8000
const db = await Deno.openKv()
const app = new Application()
const router = new Router()

const setHeaders = (ctx: any) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*")
  ctx.response.headers.set("Cache-Control", "no-cache")
  ctx.response.headers.set("Access-Control-Allow-Methods: GET, POST, OPTIONS")
  ctx.response.headers.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
}

router.get('/', async (ctx) => {
  const params = ctx.request.url.search
  const key = `${params.split('?key=')[1] ?? ''}`

  await db.atomic().sum(['views', key], 1n).commit()

  const res = await db.get(['views', key])
  const views = res.value.value


  setHeaders(ctx)
  ctx.response.body = views
})

router.get('/views', async (ctx) => {
  const total: { [key: string]: any } = {}

  const entries = await db.list({ prefix: ['views'] })
  for await (const entry of entries) {
    const res = await db.get(entry.key)
    total[String(entry.key[1])] = Number(res.value.value) || 0
  }

  setHeaders(ctx)
  ctx.response.body = total
})

app.use(router.routes())
app.use(router.allowedMethods())

console.log('Running on port: ', port)
await app.listen({ port })

