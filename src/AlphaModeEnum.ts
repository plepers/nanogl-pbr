import Enum from "./Enum";


export const AlphaModes = [
  "OPAQUE",
  "MASK",
  "BLEND"
] as const

export type AlphaModeEnum = Enum<typeof AlphaModes>
