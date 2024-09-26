import { createKysely } from '../../db/kysely'
import { Env } from '../../env'
import { Name } from '../../models'
import { DB_NAME, stringifyNameForDb } from './utils'

export async function set(nameData: Name, env: Env) {
  const db = createKysely(env)
  const body = stringifyNameForDb(nameData)

  await db
    .insertInto(DB_NAME)
    .values(body)
    .onConflict((oc) => oc.column('name').doUpdateSet(body))
    .execute()
}
