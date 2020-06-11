import Enum from "./Enum";

export const ColorSpace = [
  'COLORSPACE_LINEAR',
  'COLORSPACE_SRGB',
] as const

export type ColorSpaceEnum = Enum<typeof ColorSpace>
