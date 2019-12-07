declare type Swizzle = 'xxxx' | 'xxx' | 'xx' | 'x' | 'yxxx' | 'yxx' | 'yx' | 'zxxx' | 'zxx' | 'zx' | 'wxxx' | 'wxx' | 'wx' | 'xyxx' | 'xyx' | 'yyxx' | 'yyx' | 'zyxx' | 'zyx' | 'wyxx' | 'wyx' | ' xx' | 'xzx' | 'yzxx' | 'yzx' | 'zzxx' | 'zzx' | 'wzxx' | 'wzx' | 'xwxx' | 'xwx' | 'ywxx' | 'ywx' | 'zwxx' | 'zwx' | 'wwxx' | 'wwx' | 'xxyx' | 'yxyx' | 'zxyx' | 'wxyx' | 'xyyx' | 'yyyx' | 'zyyx' | 'wyyx' | 'xzyx' | 'yzyx' | 'zzyx' | 'wzyx' | 'xwyx' | 'ywyx' | 'zwyx' | 'wwyx' | 'xxzx' | 'yxzx' | 'zxzx' | 'wxzx' | 'xyzx' | 'yyzx' | 'zyzx' | 'wyzx' | 'xzzx' | 'yzzx' | 'zzzx' | 'wzzx' | 'xwzx' | 'ywzx' | 'zwzx' | 'wwzx' | 'xxwx' | 'yxwx' | 'zxwx' | 'wxwx' | 'xywx' | 'yywx' | 'zywx' | 'wywx' | 'xzwx' | 'yzwx' | 'zzwx' | 'wzwx' | 'xwwx' | 'ywwx' | 'zwwx' | 'wwwx' | 'xxxy' | 'yxxy' | 'zxxy' | 'wxxy' | 'xyxy' | 'yyxy' | 'zyxy' | 'wyxy' | 'xzxy' | 'yzxy' | 'zzxy' | 'wzxy' | 'xwxy' | 'ywxy' | 'zwxy' | 'wwxy' | 'xxyy' | 'xxy' | 'yxyy' | 'yxy' | 'zxyy' | 'zxy' | 'wxyy' | 'wxy' | 'xyyy' | 'xyy' | 'xy' | 'yyyy' | 'yyy' | 'yy' | 'y' | 'zyyy' | 'zyy' | 'zy' | 'wyyy' | 'wyy' | 'wy' | 'xzyy' | 'xzy' | 'yzyy' | 'yzy' | 'zzyy' | 'zzy' | 'wzyy' | 'wzy' | 'xwyy' | 'xwy' | 'ywyy' | 'ywy' | 'zwyy' | 'zwy' | 'wwyy' | 'wwy' | 'xxzy' | 'yxzy' | 'zxzy' | 'wxzy' | 'xyzy' | 'yyzy' | 'zyzy' | 'wyzy' | 'xzzy' | 'yzzy' | 'zzzy' | 'wzzy' | 'xwzy' | 'ywzy' | 'zwzy' | 'wwzy' | 'xxwy' | 'yxwy' | 'zxwy' | 'wxwy' | 'xywy' | 'yywy' | 'zywy' | 'wywy' | 'xzwy' | 'yzwy' | 'zzwy' | 'wzwy' | 'xwwy' | 'ywwy' | 'zwwy' | 'wwwy' | 'xxxz' | 'yxxz' | 'zxxz' | 'wxxz' | 'xyxz' | 'yyxz' | 'zyxz' | 'wyxz' | 'xzxz' | 'yzxz' | 'zzxz' | 'wzxz' | 'xwxz' | 'ywxz' | 'zwxz' | 'wwxz' | 'xxyz' | 'yxyz' | 'zxyz' | 'wxyz' | 'xyyz' | 'yyyz' | 'zyyz' | 'wyyz' | 'xzyz' | 'yzyz' | 'zzyz' | 'wzyz' | 'xwyz' | 'ywyz' | 'zwyz' | 'wwyz' | 'xxzz' | 'xxz' | 'yxzz' | 'yxz' | 'zxzz' | 'zxz' | 'wxzz' | 'wxz' | 'xyzz' | 'xyz' | 'yyzz' | 'yyz' | 'zyzz' | 'zyz' | 'wyzz' | 'wyz' | 'xzzz' | 'xzz' | 'xz' | 'yzzz' | 'yzz' | 'yz' | 'zzzz' | 'zzz' | 'zz' | 'z' | 'wzzz' | 'wzz' | 'wz' | 'xwzz' | 'xwz' | 'ywzz' | 'ywz' | 'zwzz' | 'zwz' | 'wwzz' | 'wwz' | 'xxwz' | 'yxwz' | 'zxwz' | 'wxwz' | 'xywz' | 'yywz' | 'zywz' | 'wywz' | 'xzwz' | 'yzwz' | 'zzwz' | 'wzwz' | 'xwwz' | 'ywwz' | 'zwwz' | 'wwwz' | 'xxxw' | 'yxxw' | 'zxxw' | 'wxxw' | 'xyxw' | 'yyxw' | 'zyxw' | 'wyxw' | 'xzxw' | 'yzxw' | 'zzxw' | 'wzxw' | 'xwxw' | 'ywxw' | 'zwxw' | 'wwxw' | 'xxyw' | 'yxyw' | 'zxyw' | 'wxyw' | 'xyyw' | 'yyyw' | 'zyyw' | 'wyyw' | 'xzyw' | 'yzyw' | 'zzyw' | 'wzyw' | 'xwyw' | 'ywyw' | 'zwyw' | 'wwyw' | 'xxzw' | 'yxzw' | 'zxzw' | 'wxzw' | 'xyzw' | 'yyzw' | 'zyzw' | 'wyzw' | 'xzzw' | 'yzzw' | 'zzzw' | 'wzzw' | 'xwzw' | 'ywzw' | 'zwzw' | 'wwzw' | 'xxww' | 'xxw' | 'yxww' | 'yxw' | 'zxww' | 'zxw' | 'wxww' | 'wxw' | 'xyww' | 'xyw' | 'yyww' | 'yyw' | 'zyww' | 'zyw' | 'wyww' | 'wyw' | 'xzww' | 'xzw' | 'yzww' | 'yzw' | 'zzww' | 'zzw' | 'wzww' | 'wzw' | 'xwww' | 'xww' | 'xw' | 'ywww' | 'yww' | 'yw' | 'zwww' | 'zww' | 'zw' | 'wwww' | 'www' | 'ww' | 'w' | 'rrrr' | 'rrr' | 'rr' | 'r' | 'grrr' | 'grr' | 'gr' | 'brrr' | 'brr' | 'br' | 'arrr' | 'arr' | 'ar' | 'rgrr' | 'rgr' | 'ggrr' | 'ggr' | 'bgrr' | 'bgr' | 'agrr' | 'agr' | 'rbrr' | 'rbr' | 'gbrr' | 'gbr' | 'bbrr' | 'bbr' | 'abrr' | 'abr' | 'rarr' | 'rar' | 'garr' | 'gar' | 'barr' | 'bar' | 'aarr' | 'aar' | 'rrgr' | 'grgr' | 'brgr' | 'argr' | 'rggr' | 'gggr' | 'bggr' | 'aggr' | 'rbgr' | 'gbgr' | 'bbgr' | 'abgr' | 'ragr' | 'gagr' | 'bagr' | 'aagr' | 'rrbr' | 'grbr' | 'brbr' | 'arbr' | 'rgbr' | 'ggbr' | 'bgbr' | 'agbr' | 'rbbr' | 'gbbr' | 'bbbr' | 'abbr' | 'rabr' | 'gabr' | 'babr' | 'aabr' | 'rrar' | 'grar' | 'brar' | 'arar' | 'rgar' | 'ggar' | 'bgar' | 'agar' | 'rbar' | 'gbar' | 'bbar' | 'abar' | 'raar' | 'gaar' | 'baar' | 'aaar' | 'rrrg' | 'grrg' | 'brrg' | 'arrg' | 'rgrg' | 'ggrg' | 'bgrg' | 'agrg' | 'rbrg' | 'gbrg' | 'bbrg' | 'abrg' | 'rarg' | 'garg' | 'barg' | 'aarg' | 'rrgg' | 'rrg' | 'grgg' | 'grg' | 'brgg' | 'brg' | 'argg' | 'arg' | 'rggg' | 'rgg' | 'rg' | 'gggg' | 'ggg' | 'gg' | 'g' | 'bggg' | 'bgg' | 'bg' | 'aggg' | 'agg' | 'ag' | 'rbgg' | 'rbg' | 'gbgg' | 'gbg' | 'bbgg' | 'bbg' | 'abgg' | 'abg' | 'ragg' | 'rag' | 'gagg' | 'gag' | 'bagg' | 'bag' | 'aagg' | 'aag' | 'rrbg' | 'grbg' | 'brbg' | 'arbg' | 'rgbg' | 'ggbg' | 'bgbg' | 'agbg' | 'rbbg' | 'gbbg' | 'bbbg' | 'abbg' | 'rabg' | 'gabg' | 'babg' | 'aabg' | 'rrag' | 'grag' | 'brag' | 'arag' | 'rgag' | 'ggag' | 'bgag' | 'agag' | 'rbag' | 'gbag' | 'bbag' | 'abag' | 'raag' | 'gaag' | 'baag' | 'aaag' | 'rrrb' | 'grrb' | 'brrb' | 'arrb' | 'rgrb' | 'ggrb' | 'bgrb' | 'agrb' | 'rbrb' | 'gbrb' | 'bbrb' | 'abrb' | 'rarb' | 'garb' | 'barb' | 'aarb' | 'rrgb' | 'grgb' | 'brgb' | 'argb' | 'rggb' | 'gggb' | 'bggb' | 'aggb' | 'rbgb' | 'gbgb' | 'bbgb' | 'abgb' | 'ragb' | 'gagb' | 'bagb' | 'aagb' | 'rrbb' | 'rrb' | 'grbb' | 'grb' | 'brbb' | 'brb' | 'arbb' | 'arb' | 'rgbb' | 'rgb' | 'ggbb' | 'ggb' | 'bgbb' | 'bgb' | 'agbb' | 'agb' | 'rbbb' | 'rbb' | 'rb' | 'gbbb' | 'gbb' | 'gb' | 'bbbb' | 'bbb' | 'bb' | 'b' | 'abbb' | 'abb' | 'ab' | 'rabb' | 'rab' | 'gabb' | 'gab' | 'babb' | 'bab' | 'aabb' | 'aab' | 'rrab' | 'grab' | 'brab' | 'arab' | 'rgab' | 'ggab' | 'bgab' | 'agab' | 'rbab' | 'gbab' | 'bbab' | 'abab' | 'raab' | 'gaab' | 'baab' | 'aaab' | 'rrra' | 'grra' | 'brra' | 'arra' | 'rgra' | 'ggra' | 'bgra' | 'agra' | 'rbra' | 'gbra' | 'bbra' | 'abra' | 'rara' | 'gara' | 'bara' | 'aara' | 'rrga' | 'grga' | 'brga' | 'arga' | 'rgga' | 'ggga' | 'bgga' | 'agga' | 'rbga' | 'gbga' | 'bbga' | 'abga' | 'raga' | 'gaga' | 'baga' | 'aaga' | 'rrba' | 'grba' | 'brba' | 'arba' | 'rgba' | 'ggba' | 'bgba' | 'agba' | 'rbba' | 'gbba' | 'bbba' | 'abba' | 'raba' | 'gaba' | 'baba' | 'aaba' | 'rraa' | 'rra' | 'graa' | 'gra' | 'braa' | 'bra' | 'araa' | 'ara' | 'rgaa' | 'rga' | 'ggaa' | 'gga' | 'bgaa' | 'bga' | 'agaa' | 'aga' | 'rbaa' | 'rba' | 'gbaa' | 'gba' | 'bbaa' | 'bba' | 'abaa' | 'aba' | 'raaa' | 'raa' | 'ra' | 'gaaa' | 'gaa' | 'ga' | 'baaa' | 'baa' | 'ba' | 'aaaa' | 'aaa' | 'aa' | 'a';
export default Swizzle;
