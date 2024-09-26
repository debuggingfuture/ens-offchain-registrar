import type { IRequest } from 'itty-router'
import zod from 'zod'

import { Env } from '../env'
import { get } from './functions/get'

export async function getWhitelist(request:any, env:any) {
  const schema = zod.object({
    name: zod.string().regex(/^[a-z0-9-.]+$/),
  })
  const safeParse = schema.safeParse(request.params)

  
  if (!safeParse.success) {
    return Response.json({ error: safeParse.error }, { status: 400 })
  }

  const { name } = safeParse.data
  const nameData = await get(name, env);

  if (nameData === null) {
    return new Response('Name not found', { status: 404 })
  }

  return Response.json(nameData, {
    status: 200,
  })
}
