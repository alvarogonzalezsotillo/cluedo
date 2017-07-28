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

function describe(o){
    console.log( "describe:" + o );
    for( i in o ){
        console.log( "  " + i + ":" + o[i] );
    }
}

function log(s){
    console.log(s);
}

function assert(b){
    if( !b ){
        undefined();
    }
}



function CP(name){
    this._name=name;
}



CP.prototype = {

    toString: function(){
        return this.name() + ":[" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_") + "]";
    },

    defined: function(){
        return this.canBeTrue() ^ this.canBeFalse();
    },

    
    name: function(){
        return this._name;
    },


    impossible: function(){
        return !this.canBeTrue() && !this.canBeFalse();
    },

    canBeTrue: function(){
        return this._canBeTrue;
    },

    canBeFalse: function(){
        return this._canBeFalse;
    },

    isFalse: function(){
        return this.defined() && this.canBeFalse();
    },

    isTrue: function(){
        return this.defined() && this.canBeTrue();
    },

    propagate: function(){
    }

};

function CPBoolean(name){
    CP.call(this,name);
    this._canBeTrue = true;
    this._canBeFalse = true;
}


InheritAndExtend(CP,CPBoolean, {
    
    remove: function(value){
        if( value ){
            this._canBeTrue = false;
        }
        else{
            this._canBeFalse = false;
        }
    },

});


function CPNot(cp){
    CP.call(this,"Not(" + cp.name() + ")" ); 
    this._cp = cp;
}

InheritAndExtend(CP,CPNot, {
    
    defined: function(){
        return this._cp.defined();
    },

    canBeTrue: function(){
        return this._cp.canBeFalse();
    },

    canBeFalse: function(){
        return this._cp.canBeTrue();
    },


    remove: function(value){
        this._cp.remove(!value);
    }

});


function CPAnd(cps){
    assert(cps.length > 0);
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        names += " " + cps[i].name();
    }
    CPBoolean.call(this,"And(" + names + ")" );
    this._cps = cps;
    this._canBeTrue = true;
    this._canBeFalse = true;
}


InheritAndExtend(CPBoolean,CPAnd, {
    
    propagate: function(){
        var anyFalse = false;
        var allTrue = true;
        for( var i = 0 ; i < this._cps.length ; i++ ){
            if( this._cps[i].isFalse() ){
                anyFalse = true;
                allTrue = false;
            }
            if( !this._cps[i].defined() ){
                allTrue = false;
            }
        }
        if( anyFalse ){
            this.remove(true);
        }
        if( allTrue ){
            this.remove(false);
        }
    }
});


function CPOr(cps){
    assert(cps.length > 0);
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        names += " " + cps[i].name();
    }
    CPBoolean.call(this,"Or(" + names + ")" );
    this._cps = cps;
    this._canBeTrue = true;
    this._canBeFalse = true;
}

InheritAndExtend(CPBoolean,CPOr, {
    
    propagate: function(){
        var anyTrue = false;
        var allFalse = true;
        for( var i = 0 ; i < this._cps.length ; i++ ){
            if( this._cps[i].isTrue() ){
                anyTrue = true;
                allFalse = false;
            }
            if( !this._cps[i].defined() ){
                allFalse = false;
            }
        }
        if( anyTrue ){
            this.remove(false);
        }
        if( allFalse ){
            this.remove(true);
        }
    }
});



CP.Boolean = function(name){ return new CPBoolean(name); };
CP.And = function(cps){ return new CPAnd(cps); };
CP.Or = function(cps){ return new CPOr(name); };
CP.Not = function(cp){ return new CPNot(cp); };


var a = CP.Boolean("a");
var b = CP.Boolean("b");
var notA = CP.Not(a);
var andNAB = CP.And([notA,b]);


log(a.toString());
log(b.toString());
log(notA.toString());
log(andNAB.toString());

a.remove(false);
log( "-------Removed false from a");

log(a.toString());
log(b.toString());
log(notA.toString());
log(andNAB.toString());

log( "-------Propagate");
andNAB.propagate();
log(andNAB.toString());

