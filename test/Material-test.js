//@ts-check

var expect  = require( 'expect.js' );


import {StandardSpecular} from '../StandardPass'
import {createContext, destroyContext} from './utils/glcontext'
import { Uniform } from '../Input';


describe( "Material", function(){
    
    let gl;

    before(function () {
        gl = createContext();
      });
    
      after( function(){
        destroyContext( gl );
      })
      

    it( 'detach should work', function(){
        const pass = new StandardSpecular()
        const cFactor = new Uniform( 'uBasecolorFactor', 4 );
        pass.surface.baseColorFactor.attach(cFactor, 'rgb' )
    });
})