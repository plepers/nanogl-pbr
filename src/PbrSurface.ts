import Chunk from "./Chunk";
import Input, { ShaderType } from "./Input";
import Enum from "./Enum";
import ChunksSlots from "./ChunksSlots";

/** The types PBR worflows. */
export enum PbrWorkflowType {
  NONE      = 'NONE',
  METALNESS = 'METALNESS',
  SPECULAR  = 'SPECULAR' ,
}

/** A PBR surface. */
export type PbrSurface = MetalnessSurface | SpecularSurface;

/**
 * This class is the base class for all PBR surfaces.
 *
 * It handles the code generation for a PBR surface in
 * a shader chunk.
 *
 * @extends {Chunk}
 */
export abstract class AbstractPbrSurface extends Chunk {
  /** The type of PBR workflow */
  readonly type : PbrWorkflowType = PbrWorkflowType.NONE;

  /** The shader input for the PBR type */
  protected pbrInputType: Enum<readonly ["SPECULAR", "METALNESS"]>;

  constructor(){
    super( true, false );
    this.pbrInputType = new Enum( 'pbrWorkflow' , ['SPECULAR', 'METALNESS'] as const )
    this.addChild(this.pbrInputType);
  }

  /**
   * Generate the shader code for this PBR surface.
   * @param slots The slots to add the code to
   */
  protected _genCode(slots: ChunksSlots): void {
    slots.add( 'pbrsurface', 'PbrSurface surface = DefaultPbrSurface;' )
  }

}



import metalnessGlsl from './glsl/includes/pbr-inputs-metalness.glsl'

/**
 * This class handles the code generation for a PBR surface
 * with metalness workflow in a shader chunk.
 *
 * @extends {AbstractPbrSurface}
 */
export class MetalnessSurface extends AbstractPbrSurface {

  readonly type : PbrWorkflowType.METALNESS = PbrWorkflowType.METALNESS;

  /** The base color */
  readonly baseColor      : Input;
  /** The base color factor */
  readonly baseColorFactor: Input;
  /** The metalness value */
  readonly metalness      : Input;
  /** The metalness factor */
  readonly metalnessFactor: Input;
  /** The roughness value */
  readonly roughness      : Input;
  /** The roughness factor */
  readonly roughnessFactor: Input;


  constructor(){
    super();
    this.pbrInputType.set(this.type)
    this.addChild( this.baseColor        = new Input( 'baseColor'           , 3 ) );
    this.addChild( this.baseColorFactor  = new Input( 'baseColorFactor'     , 3 ) );
    this.addChild( this.metalness        = new Input( 'metalness'           , 1 ) );
    this.addChild( this.metalnessFactor  = new Input( 'metalnessFactor'     , 1 ) );
    this.addChild( this.roughness        = new Input( 'roughness'           , 1 ) );
    this.addChild( this.roughnessFactor  = new Input( 'roughnessFactor'     , 1 ) );

  }

  /**
   * Generate the shader code for this Metalness surface.
   * @param slots The slots to add the code to
   */
  protected _genCode(slots: ChunksSlots): void {
    slots.add( 'pbrsurface', metalnessGlsl() )
  }

}





import specularGlsl from './glsl/includes/pbr-inputs-specular.glsl'
import { ColorSpace } from "./ColorSpace";

/**
 * This class handles the code generation for a PBR surface
 * with specular workflow in a shader chunk.
 *
 * @extends {AbstractPbrSurface}
 */
export class SpecularSurface extends AbstractPbrSurface {

  readonly type : PbrWorkflowType.SPECULAR = PbrWorkflowType.SPECULAR;

  /** The base color */
  readonly baseColor       : Input;
  /** The base color factor */
  readonly baseColorFactor : Input;
  /** The specular color */
  readonly specular        : Input;
  /** The specular factor */
  readonly specularFactor  : Input;
  /** The glossiness value */
  readonly glossiness      : Input;
  /** The glossiness factor */
  readonly glossinessFactor: Input;

  constructor(){
    super();
    this.pbrInputType.set(this.type)
    this.addChild( this.baseColor        = new Input( 'diffuse'             , 3 ) );
    this.addChild( this.baseColorFactor  = new Input( 'diffuseFactor'       , 3 ) );
    this.addChild( this.specular         = new Input( 'specular'            , 3 ) );
    this.addChild( this.specularFactor   = new Input( 'specularFactor'      , 3 ) );
    this.addChild( this.glossiness       = new Input( 'glossiness'          , 1 ) );
    this.addChild( this.glossinessFactor = new Input( 'glossinessFactor'    , 1 ) );
  }

  /**
   * Generate the shader code for this Specular surface.
   * @param slots The slots to add the code to
   */
  protected _genCode(slots: ChunksSlots): void {
    slots.add( 'pbrsurface', specularGlsl() )
  }

}