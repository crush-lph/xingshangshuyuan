// Generated from Apifox export. Update through the Apifox document, not by hand.

export type QueryValue = string | number | boolean

export type EmptyObject = Record<string, never>

export interface ApiResponse<TData = EmptyObject> {
  code: number
  info: string
  data: TData
}
