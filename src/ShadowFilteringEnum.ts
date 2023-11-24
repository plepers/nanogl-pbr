import Enum from "./Enum";

/**
 * The shadow filtering modes.
 * @enum
 */
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

/** An Enum for the shadow filtering modes. */
export type ShadowFilteringEnum = Enum<typeof ShadowFiltering>
