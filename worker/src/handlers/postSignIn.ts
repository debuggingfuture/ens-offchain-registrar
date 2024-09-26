import type { IRequest } from 'itty-router'
import zod from 'zod'

import { Env } from '../env'
import { get } from './functions/get'

export async function postSignIn(request:any, env:any) {
  const schema = zod.object({
    signature: zod.string()
  })
  const safeParse = schema.safeParse(request.params)

  
  if (!safeParse.success) {
    return Response.json({ error: safeParse.error }, { status: 400 })
  }

  const { signature } = safeParse.data
  console.log('signature', signature)
//   const nameData = await get(name, env);

//   if (nameData === null) {
//     return new Response('Name not found', { status: 404 })
//   }

  return Response.json({}, {
    status: 200,
  })
}
