import Enum from "./enum";

enum GammaMode {
  GAMMA_NONE,
  GAMMA_STD,
  GAMMA_2_2,
  GAMMA_TB
}

export type GammaModeEnum = Enum<typeof GammaMode>

export default GammaMode;