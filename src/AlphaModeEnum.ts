import Enum from "./Enum";

/** The alpha rendering modes. */
export const AlphaModes = [
  /** Fully opaque */
  "OPAQUE",
  /** Masked visibility (discard pixels where alpha < alpha cutoff) */
  "MASK",
  /** Blended visibility */
  "BLEND"
] as const

/**
 * An Enum for the alpha rendering modes.
 * @resolveTypeof
 */
export type AlphaModeEnum = Enum<typeof AlphaModes>
