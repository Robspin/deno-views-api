import { Application, Router } from "https://deno.land/x/oak/mod.ts"
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const port = 8000
const db = await Deno.openKv()
const app = new Application()
const router = new Router()

router.get('/', async (ctx) => {
  const params = ctx.request.url.search
  const key = `${params.split('?key=')[1] ?? ''}`

  await db.atomic().sum(['views', key], 1n).commit()

  const res = await db.get(['views', key])
  const views = res.value.value

  ctx.response.body = views
})

router.get('/views', async (ctx) => {
  const total: { [key: string]: any } = {}

  const entries = await db.list({ prefix: ['views'] })
  for await (const entry of entries) {
    const res = await db.get(entry.key)
    total[String(entry.key[1])] = Number(res.value.value) || 0
  }
  ctx.response.body = total
})

app.use(router.routes())
app.use(oakCors({ origin: '*' }))

console.log('Running on port: ', port)
await app.listen({ port })

