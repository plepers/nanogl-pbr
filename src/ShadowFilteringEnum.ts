import Enum from "./Enum";

/** The shadow filtering modes. */
export const ShadowFiltering = [
  /** No shadow filtering */
  'PCFNONE',
  /** 4x1 PCF (Percentage Closer Filtering) */
  'PCF4x1',
  /** 4x4 PCF (Percentage Closer Filtering) */
  'PCF4x4',
  /** 2x2 PCF (Percentage Closer Filtering) */
  'PCF2x2',
] as const

/**
 * An Enum for the shadow filtering modes.
 * @resolveTypeof
 */
export type ShadowFilteringEnum = Enum<typeof ShadowFiltering>
