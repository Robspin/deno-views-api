import { serve } from "https://deno.land/std@0.155.0/http/server.ts"

const db = await Deno.openKv()

serve(async (req: Request) => {
  const pageKey = req.url.split('?key=')[1] ?? ''
  const key = `${pageKey}_views}`

  await db.atomic().sum([key], 1n).commit()

  const res = await db.get([key])
  const views = res.value.value

  return new Response(views)
})
