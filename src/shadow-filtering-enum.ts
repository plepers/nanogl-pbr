import Enum from "./enum";


export const ShadowFiltering = [
  'PCFNONE',
  'PCF4x1',
  'PCF4x4',
  'PCF2x2',
] as const


export type ShadowFilteringEnum = Enum<typeof ShadowFiltering>
