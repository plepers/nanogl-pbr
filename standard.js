var Program      = require( 'nanogl/program' );
var glslify      = require( 'glslify' );

var ProgramCache = require( './lib/program-cache' );
var Input        = require('./lib/input' );
var InputList    = require('./lib/input-list' );

var Dat     = require( 'dat-gui' );

var M4 = require( 'gl-matrix' ).mat4.create();



function StandardMaterial( gl ){
  this.ibl = null;


  this.inputs      = new InputList();
  this.iAlbedo     = this.inputs.add( 'albedo',    3 );
  this.iSpecular   = this.inputs.add( 'specular',  3 );
  this.iRoughness  = this.inputs.add( 'roughness', 1 );
  this.iNormal     = this.inputs.add( 'normal',    3 );
  this.iOcclusion  = this.inputs.add( 'occlusion', 1 );


  this.albedo    = this.iAlbedo   .attachSampler( 'tAlbedo'    , 'vTexCoord0' );
  this.specular  = this.iSpecular .attachSampler( 'tSpecular'  , 'vTexCoord0' );
  this.roughness = this.iRoughness.attachSampler( 'tRoughness' , 'vTexCoord0' );
  this.normals   = this.iNormal   .attachSampler( 'tNormal'    , 'vTexCoord0' );
  this.occlusion = this.iOcclusion.attachSampler( 'tOcclusion' , 'vTexCoord0' );


  this._prgcache = ProgramCache.getCache( gl );
  // for program-cache
  this._uid       = 'std';
  this._vertSrc   = glslify( './glsl/pbr.vert' );
  this._fragSrc   = glslify( './glsl/pbr.frag' );
  this._precision = 'highp'


}

StandardMaterial.prototype = {


  setIBL : function( ibl ){
    this.ibl = ibl;
  },


  // render time !
  // ----------
  prepare : function( node, camera ){

    if( this._isDirty() ){
      this._compile();
    }

    // this.

    var prg = this.prg;
    prg.use()

    prg.setupInputs( this )

    this.ibl.setupProgram( prg );

    // matrices
    camera.modelViewProjectionMatrix( M4, node._wmatrix );
    prg.uMVP(          M4            );
    prg.uWorldMatrix(  node._wmatrix );

    //
    prg.uCameraPosition( camera._wposition );

    // tmp
    if( this.roughnessTex ){
      prg.tRoughness( this.roughnessTex );
    } else {
      prg.uRoughness( this.roughness );
    }


    if( this.specularTex ){
      prg.tSpecular( this.specularTex );
    } else {
      prg.uSpecular(
        this.specular[0]/0xff,
        this.specular[1]/0xff,
        this.specular[2]/0xff
      );
    }

    if( this.albedoTex ){
      prg.tAlbedo( this.albedoTex );
    } else {
      prg.uAlbedo(
        this.albedo[0]/0xff,
        this.albedo[1]/0xff,
        this.albedo[2]/0xff
      );
    }

    if( this.normalTex ){
      prg.tNormal( this.normalTex );
    }

    if( this.occlusionTex ){
      prg.tOcclusion( this.occlusionTex );
    }


    prg.uFresnel(
      this.fresnel[0]/0xff,
      this.fresnel[1]/0xff,
      this.fresnel[2]/0xff
    );

  },



  // need recompilation
  _isDirty : function(){
    if( this.prg === null || this.inputs._isDirty() ){
      return true;
    }
    return false;
  },


  compile : function(){
    if( this.prg !== null ){
      this._prgcache.release( prg );
    }
    this.prg = this._prgcache.compile( this );
  }



}

module.exports = StandardMaterial;