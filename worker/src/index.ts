import { Router, createCors, json } from 'itty-router'

import { Env } from './env'
import { getCcipRead, getName, getNames, setName } from './handlers'
import { postCcipRead } from './handlers/postCcipRead'

const { preflight, corsify } = createCors({
  origins: ['*'],
  // allowHeaders: ['Content-Type'],
  allowMethods: ['GET', 'POST'],
})
const router = Router()

router
  .all('*', preflight)
  .get('/lookup/:sender/:data.json', (request, env) =>
    getCcipRead(request, env)
  )
  .post('/lookup/:sender', (request, env) =>
    postCcipRead(request, env)
  )
  .get('/get/:name', (request, env) => getName(request, env))
  .get('/names', (request, env) => getNames(env))
  .post('/set', (request, env) => setName(request, env))
  .all('*', () => new Response('Not found', { status: 404 }))

// Handle requests to the Worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return router.handle(request, env).then(corsify)
  },
}
