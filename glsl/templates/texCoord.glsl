
{{= if( obj.declare_fragment_varying === true ){ }}
  #ifndef TC_DEF_V_{{@varying}}
  #define TC_DEF_V_{{@varying}} 1
  IN mediump vec2 {{@varying}};
  #endif
{{= } }}


{{= if( obj.declare_vertex_varying === true ){ }}
  #ifndef TC_DEF_V_{{@varying}}
  #define TC_DEF_V_{{@varying}} 1
  OUT mediump vec2 {{@varying}};
  #endif
{{= } }}


{{= if( obj.declare_attribute === true ){ }}
  #ifndef TC_DEF_A_{{@attrib}}
  #define TC_DEF_A_{{@attrib}} 1
    IN mediump vec2 {{@attrib}};
  #endif
{{= } }}


{{= if( obj.vertex_body === true ){ }}

  #define TC {{@varying}}
  TC = {{@attrib}};
  
  #if HAS_tct_rs_{{@uid}}
    TC = mat2( tct_rs_{{@uid}}() ) * TC;
  #endif

  #if HAS_tct_t_{{@uid}}
    TC += tct_t_{{@uid}}();
  #endif

  #undef TC

{{= } }}
