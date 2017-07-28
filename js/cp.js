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
    CP.call(this,"And(" + names + ")" );
    this._cps = cps;
    this._canBeTrue = true;
    this._canBeFalse = true;
}


InheritAndExtend(CP,CPAnd, {
    
    
    remove: function(value){
        if( value ){
            this._canBeTrue = false;
        }
        else{
            this._canBeFalse = false;
        }
    }, 

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


var a = new CPBoolean("a");
var b = new CPBoolean("b");
var notA = new CPNot(a);
var andNAB = new CPAnd([notA,b]);


log(a.toString());
log(b.toString());
log(notA.toString());
log(andNAB.toString());

a.remove(false);
log( "removed false from a");

log(a.toString());
log(b.toString());
log(notA.toString());
log(andNAB.toString());

log( "Propagate");
andNAB.propagate();
log(andNAB.toString());

