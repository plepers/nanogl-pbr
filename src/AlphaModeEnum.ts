import Enum from "./Enum";

/**
 * The alpha rendering modes.
 * @enum
 */
export const AlphaModes = [
  /** Fully opaque */
  "OPAQUE",
  /** Masked visibility (discard pixels where alpha < alpha cutoff) */
  "MASK",
  /** Blended visibility */
  "BLEND"
] as const

/** An Enum for the alpha rendering modes. */
export type AlphaModeEnum = Enum<typeof AlphaModes>
