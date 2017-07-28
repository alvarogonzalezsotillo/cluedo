
function describe(o){
    console.log( "describe:" + o );
    for( i in o ){
        console.log( "  " + i + ":" + o[i] );
    }
}


function InheritAndExtend(src,dst,ext){
    for( p in src.prototype){
        dst.prototype[p] = src.prototype[p];
    }
    if( ext ){
        for( p in ext){
            dst.prototype[p] = ext[p];
        }
    }
}

console.log("hola");


function A(a){
    this._a = a;
}

A.prototype.fa = function(){
    console.log("fa:" + this );
};
    
function B(b){
    A.call(this,"a" + b );
    this._b = b;
}

InheritAndExtend(A,B);

var a = new A("a");
var b = new B("b");

console.log(a);
console.log(b);

a.fa();
b.fa();

function C(c){
    B.call(this,"b" + c );
    this._c = c;
}

var c = new C("c");

InheritAndExtend(B,C,{
    fc: function(){
        console.log("fc:" + this );
    }
});


describe(c);

c.fa();
c.fc();


