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
    this._dependants = [];
}



CP.prototype = {

    addDependant : function(d){
        this._dependants.push(d);
    },

    notifyDependants : function(){
        for( var i = 0 ; i < this._dependants.length ; i++ ){
            this._dependants[i].reduceOwnDomain();
        }
    },
    
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

    reduceOwnDomain: function(){
    },

    reduceOthersDomain: function(){
    }


};

function CPBoolean(name){
    CP.call(this,name);
    this._canBeTrue = true;
    this._canBeFalse = true;
}


InheritAndExtend(CP,CPBoolean, {
    remove: function(value){
        if( value && this._canBeTrue ){
            this._canBeTrue = false;
            this.reduceOthersDomain();
            this.notifyDependants();
            return true;
        }
        
        if( !value && this._canBeFalse ){
            this._canBeFalse = false;
            this.reduceOthersDomain();
            this.notifyDependants();
            return true;
        }
        
        return false;
    },
});


function CPNot(cp){
    CP.call(this,"Not(" + cp.name() + ")" ); 
    this._cp = cp;
    this._cp.addDependant(this);
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
        var changed = this._cp.remove(!value);
        if( changed ){
            this.notifyDependants();
        }
        return changed;
    },

    reduceOwnDomain: function(){
        this._cp.reduceOwnDomain();  
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
    for( var i = 0 ; i < this._cps.length ; i++ ){
        this._cps[i].addDependant(this);
    }
}


InheritAndExtend(CPBoolean,CPAnd, {
    
    reduceOwnDomain: function(){
        for( var i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].reduceOwnDomain();
        }

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

    reduceOthersDomain: function(){
        if( this.isTrue() ){
            for( var i = 0 ; i < this._cps.length ; i++ ){
                this._cps[i].remove(false);
            }
        }

        if( this.isFalse() ){
            // if only one cp can be false, it should be false
            var undefinedCP = undefined;
            var numberOfTrue = 0;
            for( var i = 0 ; i < this._cps.length ; i++ ){
                var cp = this._cps[i];
                if( cp.isTrue() ){
                    numberOfTrue += 1;
                }
                if( !cp.defined() ){
                    undefinedCP = cp;
                }
            }
            if( numberOfTrue == this._cps.length - 1 ){
                cp.remove(true);
            }
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
    for( var i = 0 ; i < this._cps.length ; i++ ){
        this._cps[i].addDependant(this);
    }
}

InheritAndExtend(CPBoolean,CPOr, {
    
    reduceOwnDomain: function(){

        for( var i = 0 ; i < this._cps.length ; i++ ){
            this._cps[i].reduceOwnDomain();
        }
        
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
    },

    reduceOthersDomain: function(){
        if( this.isFalse() ){
            for( var i = 0 ; i < this._cps.length ; i++ ){
                this._cps[i].remove(true);
            }
        }

        if( this.isTrue() ){
            // if only one cp can be true, it should be true
            var undefinedCP = undefined;
            var numberOfFalse = 0;
            for( var i = 0 ; i < this._cps.length ; i++ ){
                var cp = this._cps[i];
                if( cp.isFalse() ){
                    numberOfFalse += 1;
                }
                if( !cp.defined() ){
                    undefinedCP = cp;
                }
            }
            if( numberOfFalse == this._cps.length - 1 ){
                cp.remove(false);
            }
        }
    }

});



CP.Boolean = function(name){ return new CPBoolean(name); };
CP.And = function(cps){ return new CPAnd(cps); };
CP.Or = function(cps){ return new CPOr(cps); };
CP.Not = function(cp){ return new CPNot(cp); };


function test(){

    var tests = [
        function(){
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            assert(!notA.defined());

            notA.remove(true);

            assert(a.isTrue() );
        },

        function(){
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            a.remove(false);

            assert(notA.isFalse() );
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            a.remove(true);

            assert(andAB.isFalse());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            andAB.remove(false);

            assert(a.isTrue());
            assert(b.isTrue());
        },

    ];

    for( var i = 0 ; i < tests.length ; i++ ){
        log( "----- Test " + i );
        tests[i]();
    }
}

test();
