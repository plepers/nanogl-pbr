var LightType;
(function (LightType) {
    LightType[LightType["UNKNOWN"] = 0] = "UNKNOWN";
    LightType[LightType["DIRECTIONAL"] = 1] = "DIRECTIONAL";
    LightType[LightType["SPOT"] = 2] = "SPOT";
    LightType[LightType["POINT"] = 4] = "POINT";
})(LightType || (LightType = {}));
export default LightType;
