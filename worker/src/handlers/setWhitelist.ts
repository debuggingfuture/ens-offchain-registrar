import { IRequest } from 'itty-router'
import { verifyMessage } from 'viem'

import { Env } from '../env'
import { ZodName } from '../models'
import { get } from './functions/get'
import { set } from './functions/set'

export async function setWhitelist(request: IRequest, env: Env): Promise<Response> {
  const body = await request.json()
  const safeParse = ZodName.safeParse(body)

  if (!safeParse.success) {
    const response = { success: false, error: safeParse.error }
    return Response.json(response, { status: 400 })
  }

  const { name, addresses } = safeParse.data

  console.log('addresses', addresses)
  // Only allow 3LDs, no nested subdomains
  if (name.split('.').length < 2) {
    const response = { success: false, error: 'Invalid name' }
    return Response.json(response, { status: 400 })
  }

  // // Check if the name is already taken
  const existingName = await get(name, env)

  // // If the name is owned by someone else, return an error
  if (existingName) {
    const response = { success: false, error: 'name already addedd' }
    return Response.json(response, { status: 409 })
  }

  const nameData = {
    name,
    addresses
  }

  // // Save the name
  try {
    await set(nameData, env)
    const response = { success: true }
    return Response.json(response, { status: 201 })
  } catch (err) {
    console.error(err)
    const response = { success: false, error: 'Error setting name' }
    return Response.json('response', { status: 500 })
  }
}
