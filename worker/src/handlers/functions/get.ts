import { createKysely } from '../../db/kysely'
import { Env } from '../../env'
import { Name } from '../../models'
import { DB_NAME, parseNameFromDb } from './utils'

export async function get(name: string, env:Env): Promise<Name | null> {
  console.log('get', name, env.PRIVATE_KEY)

  return null;
  // const db = createKysely({
  //   PRIVATE_KEY: env.PRIVATE_KEY,
  // })
  // const record = await db
  //   .selectFrom("whitelist")
  //   .selectAll()
  //   .where('name', '=', name)
  //   .executeTakeFirst()

  // if (!record) {
  //   return null
  // }

  // return parseNameFromDb(record)
}
