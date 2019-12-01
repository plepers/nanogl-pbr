import Enum from "./enum";

enum ShadowFiltering {
  PCFNONE,
  PCF4x1,
  PCF4x4,
  PCF2x2,
}

export type ShadowFilteringEnum = Enum<typeof ShadowFiltering>

export default ShadowFiltering;