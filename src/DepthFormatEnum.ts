
import Enum from "./Enum";

/**
 * The depth pass formats.
 * @enum
 */
export const DepthFormat = [
    /** Encode depth to RGB */
    'D_RGB',
    /** Standard depth pass */
    'D_DEPTH'
] as const

/** An Enum for the depth pass formats. */
export type DepthFormatEnum = Enum<typeof DepthFormat>

export default DepthFormat