import Enum from "./Enum";

/** The gamma correction modes. */
export const GammaModes = [
  /** No gamma correction */
  'GAMMA_NONE',
  /** Standard gamma correction (using gamma value) */
  'GAMMA_STD',
  /** Gamma 2.2 correction */
  'GAMMA_2_2',
  /**
   * Alternative gamma correction,
   * using the gamma curve from Marmoset Toolbag
   */
  'GAMMA_TB',
] as const

/**
 * An Enum for the gamma correction modes.
 * @resolveTypeof
 */
export type GammaModeEnum = Enum<typeof GammaModes>
