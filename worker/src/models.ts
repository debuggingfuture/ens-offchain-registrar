import { ColumnType } from 'kysely'
import { isAddress, isHex } from 'viem'
import z from 'zod'

export const ZodName = z.object({
  name: z.string().regex(/^[a-z0-9-.]+/),
  addresses: z.record(z.string().refine((addr) => isHex(addr))).optional(),
})

export const ZodNameWithSignature = z.object({
  signature: z.object({
    hash: z.string().refine((hash) => isHex(hash)),
    message: ZodName,
  }),
  expiration: z.number(),
})

export type Name = z.infer<typeof ZodName>
export type NameWithSignature = z.infer<typeof ZodNameWithSignature>

export interface NameInKysely {
  name: string
  addresses: string | null // D1 doesn't support JSON yet, we'll have to parse it manually
  createdAt: ColumnType<Date, never, never>
  updatedAt: ColumnType<Date, never, string | undefined>
}
