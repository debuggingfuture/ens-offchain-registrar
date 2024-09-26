import { AutoRouter, cors, IRequest } from 'itty-router'
import { Env } from './env'
import { getCcipRead, getWhitelist, setWhitelist, postSignIn } from './handlers'

const { preflight, corsify } = cors(
  {
    origin: '*',
    credentials: true,
  }
)

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
})


router
  // .get('/lookup/:sender/:data.json', (request, env) =>
  //   getCcipRead(request, env)
  // )


  .get('/get/:name', (request:IRequest, env:Env) => getWhitelist(request, env))
  .post('/set', (request:IRequest, env:Env) => setWhitelist(request, env))

  // try same endpoint for cookies auth
  .post('/signin', (request:IRequest, env:Env) => postSignIn(request, env))

  .all('*', () => new Response('Not found', { status: 404 }))

// Handle requests to the Worker
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    console.log('env', env)
    return router.fetch(request, env)
  },
}
