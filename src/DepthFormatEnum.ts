
import Enum from "./Enum";

export const DepthFormat = [
    'D_RGB',
    'D_DEPTH'
] as const


export type DepthFormatEnum = Enum<typeof DepthFormat>

export default DepthFormat