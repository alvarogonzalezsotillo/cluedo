function CP(name){
    this._name=name;
}

CP.prototype = {

    toString: function(){
        return this.name + "(" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_");
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
    CP.cal
    this._canBeTrue = true;
    this._canBeFalse = true;
}



CPBoolean.prototype = {
    
    remove: function(value){
        if( value ){
            this._canBeTrue = false;
        }
        else{
            this._canBeFalse = false;
        }
    },

    prototype : CP.prototype

};


function CPNot(cp){
    this._cp = cp;
}

CPNot.prototype = {
    name: function(){
        return "Not " + this._cp.name();
    },
    
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
    },

    prototype : CP


};


function CPAnd(cps){
    assert(cps.length > 0);
    this._cps = cps;
    this._canBeTrue = true;
    this._canBeFalse = true;
}



CPAnd.prototype = {
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
    },

    prototype : CP
};


var a = new CPBoolean("a");
var b = new CP()

function describe(o){
    console.log( "describe:" + o );
    for( i in o ){
        console.log( "  " + i + ":" + o[i] );
    }
}

describe(a);
describe(b);



console.log("a:" + a);
console.log("a.remove:" + a.remove);
console.log("a.remove():" + a.remove(true));
console.log("a:" + a);
console.log("a.canBeTrue:" + a.canBeTrue);
console.log("a.canBeTrue():" + a.canBeTrue());
console.log(a.toString());
