import Chunk from "./Chunk";
import Input, { ShaderType } from "./Input";
import Enum from "./Enum";
import ChunksSlots from "./ChunksSlots";


export enum PbrWorkflowType {
  NONE      = 'NONE',
  METALNESS = 'METALNESS',
  SPECULAR  = 'SPECULAR' ,
}


export type PbrSurface = MetalnessSurface | SpecularSurface;


export abstract class AbstractPbrSurface extends Chunk {

  readonly type : PbrWorkflowType = PbrWorkflowType.NONE;
  
  protected pbrInputType: Enum<readonly ["SPECULAR", "METALNESS"]>;

  constructor(){
    super( true, false );
    this.pbrInputType = new Enum( 'pbrWorkflow' , ['SPECULAR', 'METALNESS'] as const )
    this.addChild(this.pbrInputType);
  }

  protected _genCode(slots: ChunksSlots): void {
    slots.add( 'pbrsurface', 'PbrSurface surface = DefaultPbrSurface;' )
  }

}



import metalnessGlsl from './glsl/includes/pbr-inputs-metalness.glsl'

export class MetalnessSurface extends AbstractPbrSurface {

  readonly type : PbrWorkflowType.METALNESS = PbrWorkflowType.METALNESS;
  
  readonly baseColor      : Input;
  readonly baseColorFactor: Input;
  readonly metalness      : Input;
  readonly metalnessFactor: Input;
  readonly roughness      : Input;
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

  protected _genCode(slots: ChunksSlots): void {
    slots.add( 'pbrsurface', metalnessGlsl() )
  }
  
}





import specularGlsl from './glsl/includes/pbr-inputs-specular.glsl'
import { ColorSpace } from "./ColorSpace";

export class SpecularSurface extends AbstractPbrSurface {

  readonly type : PbrWorkflowType.SPECULAR = PbrWorkflowType.SPECULAR;

  readonly baseColor       : Input;
  readonly baseColorFactor : Input;
  readonly specular        : Input;
  readonly specularFactor  : Input;
  readonly glossiness      : Input;
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
  
  protected _genCode(slots: ChunksSlots): void {
    slots.add( 'pbrsurface', specularGlsl() )
  }

}