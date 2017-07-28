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
        return this.isDefined() && this.canBeFalse();
    },

    isTrue: function(){
        return this.isDefined() && this.canBeTrue();
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
    this._cps = cps;
    this._canBeTrue = true;
    this._canBeFalse = true;
}



InheritAndExtend(CP,CPAnd, {
    name: function(){
        var ret = "Or("
        for( var i = 0 ; i < this._cps.length ; i++ ){
            ret += this._cps[i].name() + ",";
        }
        return ret + ")";
    },
    
    
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
var b = new CPNot(a);


log(a.toString());
log(b.toString());

a.remove(false);

log(a.toString());
log(b.toString());
