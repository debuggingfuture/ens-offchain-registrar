import { createKysely } from '../../db/kysely'
import { Env } from '../../env'
import { Name } from '../../models'
import { parseNameFromDb } from './utils'

export async function get(name: string, env: Env): Promise<Name | null> {
  // const db = createKysely(env)
  // const record = await db
  //   .selectFrom('names')
  //   .selectAll()
  //   .where('name', '=', name)
  //   .executeTakeFirst()

  // if (!record) {
  //   return null
  // }


  const nameRecord = {  
    name: 'demo1.ethsg24.eth',
    owner: '0x245',
    // addresses: {
    //   '0x123': '0x123',
    // },
    // texts: [],

    // https://docs.ens.domains/ensip/7
    // type do not support ipfs
    contenthash: '0x697066733a2f2f516d52415142365961437969645033375564446e6a465935765175694272637164796f57314375446777786b4434'
  } as Name;

  return nameRecord;


  // return parseNameFromDb(record)
}
