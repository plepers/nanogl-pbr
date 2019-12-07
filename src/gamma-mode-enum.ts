import Enum from "./enum";


export const GammaModes = [
  'GAMMA_NONE',
  'GAMMA_STD',
  'GAMMA_2_2',
  'GAMMA_TB',
] as const

export type GammaModeEnum = Enum<typeof GammaModes>
