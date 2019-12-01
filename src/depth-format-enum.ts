
import Enum from "./enum";

enum DepthFormat {
    D_RGB,
    D_DEPTH
}


export type DepthFormatEnum = Enum<typeof DepthFormat>

export default DepthFormat