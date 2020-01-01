import GLConfig       from 'nanogl-state/config'


export default class BaseMaterial {
  
  name: string;

  mask: number = ~0;

  glconfig : GLConfig;
  
  _vertSrc : string = '';
  _fragSrc : string = '';

  _passMap : Map<string, BaseMaterial>;
  _passes  : BaseMaterial[];


  constructor(name: string = '') {
    this.name = name;

    this.glconfig = new GLConfig();

    this._passMap = new Map()
    this._passes  = []

  }




  addPass( id:string, pass:BaseMaterial ){
    if( this._passMap.has( id ) ){
      this.removePass( id );
    }
    this._passMap.set( id, pass );
    this._passes.push( pass );
  }

  removePass( id : string ){
    if( this._passMap.has( id ) ){
      const p = this.getPass( id )!;
      this._passes.splice( this._passes.indexOf( p ), 1 );
      this._passMap.delete( id );
    }
  }

  getPass( id:string ):BaseMaterial|undefined{
    return this._passMap.get( id );
  }
  
  hasPass( id:string ):boolean{
    return this._passMap.has( id );
  }

  getAllPasses():BaseMaterial[]{
    return this._passes;
  }


  addModifier(mod: any){

  }

  getModifier(modid: string):any {

  }



}