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



function CP(name, observed ){

    this._name =name;
    this._containers = [];
    this._observed = [];
    if( observed ){
        this._observed = observed;
    }

    for( var  i = 0 ; i < this._observed.length ; i++ ){
        this._observed[i].addContainer(this);
    }
}



CP.prototype = {

    addContainer : function(d){
        this._containers.push(d);
    },

    notifyContainers : function(){
        log( this.name() + ": notifyContainers ");
        for( var i = 0 ; i < this._containers.length ; i++ ){
            var cp = this._containers[i];
            log( "  " + this.name() + ": notifyContainers: " + cp.name() );
            cp.notified();
        }
    },

    notified: function(){
        this.reduceOwnDomain();
        this.reduceObservedDomain();
    },

    describe : function(level){

        var log = console.log;
        if( !level ){
            level = 0;
            log( "DESCRIBE: " + this.name() );
        }
        
        var s = "";
        for( var i = 0 ; i < level ; i++ ){
            s += "  ";
        }
        log( s + this.toString() );

        for( var i = 0; i < this.observed().length ; i++ ){
            this.observed()[i].describe(level+1);
        }
    },

    observed : function(){
        return this._observed;
    },
    
    toString: function(){
        return this.name() + ":[" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_") + "]";
    },

    defined: function(){
        return (this.canBeTrue() && !this.canBeFalse()) || (!this.canBeTrue() && this.canBeFalse());
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
        return false;
    },

    reduceObservedDomain: function(){
        return false;
    }


};

function CPBoolean(name,observed){
    CP.call(this,name,observed);
    this._canBeTrue = true;
    this._canBeFalse = true;
}


InheritAndExtend(CP,CPBoolean, {
    remove: function(value){
        log( this.name() + ": remove:" + value );
        if( value && this._canBeTrue ){
            log( "  " + this.name() + ": remove: removed true");
            this._canBeTrue = false;
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }
        
        if( !value && this._canBeFalse ){
            log( "  " + this.name() + ":  remove: removed false");
            this._canBeFalse = false;
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }
        
        return false;
    },
});

function CPNumberTrue(cps,number){
    this._number = number;
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        names += " " + cps[i].name();
    }
    CPBoolean.call(this,"AreTrue(" + number + ")(" + names + ")", cps );
}

InheritAndExtend(CPBoolean,CPNumberTrue, {

    number : function(){
        return this._number;
    },

    status : function(){
        var cps = this.observed();

        var ret = {
            falses : [],
            trues : [],
            undefineds : []
        }

        for( var i = 0 ; i < cps.length ; i++ ){
            if( cps[i].isFalse() ){
                ret.falses.push(cps[i]);
            }
            if( cps[i].isTrue() ){
                ret.trues.push(cps[i]);
            }
            if( !cps[i].defined() ){
                ret.undefineds.push(cps[i]);
            }
        }
        
        return ret;
    },
    
    reduceOwnDomain: function(){
        var cps = this.observed();

        var log = function(s){ console.log(s); };

        
        var s = this.status();
        
        log( this.name() + ": reduceOwndomain" );
        console.log(s);

        var ret = false;
        
        if( s.trues.length > this.number() ){
            log( "  " + this.name() + ": trueNumber:" + s.trues.length + ": more true than expected");
            ret |= this.remove(true);
        }
        else if( s.falses.length > cps.length - this.number() ){
            log( "  " + this.name() + ": falses.length:" + s.falses.length + ": more false than expected" );
            ret |= this.remove(true);
        }
        else if( s.falses.length  + s.trues.length == cps.length ){
            log( "  " + this.name() + ": all defined and number correct" );
            ret |= this.remove(false);
        }
        return ret;
    },

    reduceObservedDomain: function(){
        var cps = this.observed();
        var log = function(){};

        var s = this.status();
        var remainingTrues = this.number() - s.trues.length;
        var possibleTrues = s.undefineds.length;
        
        if( this.isTrue() ){
            assert( s.trues.length <= this.number() );
            if( remainingTrues == possibleTrues ){
                log( this.name() + ": needed some more trues, the same as undefined");
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(false);
                }
                return true;
            }
        }

        if( this.isFalse() ){

            if( s.trues.length == this.number()-1 && possibleTrues == 1 ){
                log( this.name() + ": since I am false, at least one of my possible trues can not be true");
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(true);
                }
                return true;
            }
        }

        return false;
    }
});


function CPNot(cp){
    CP.call(this,"Not(" + cp.name() + ")", [cp] ); 
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
        var changed = this._cp.remove(!value);
        if( changed ){
            this.notifyContainers();
        }
        return changed;
    },

    reduceOwnDomain: function(){
        var ret = this._cp.reduceOwnDomain();
        if( ret ){
            this.notifyContainers();
        }
    },

    notified: function(){
        this.notifyContainers();
    },

    reduceObservedDomain: function(){
        return this._cp.reduceObservedDomain();
    },

});


function CPAnd(cps){
    assert(cps.length > 0);
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        names += " " + cps[i].name();
    }
    CPBoolean.apply(this, ["And(" + names + ")", cps] );
}


InheritAndExtend(CPBoolean,CPAnd, {
    
    reduceOwnDomain: function(){
        var cps = this.observed();

        var log = function(){};
        
        var anyFalse = false;
        var allTrue = true;
        for( var i = 0 ; i < cps.length ; i++ ){
            if( cps[i].isFalse() ){
                anyFalse = true;
                allTrue = false;
            }
            if( !cps[i].defined() ){
                allTrue = false;
            }
        }

        var ret = false;
        
        if( anyFalse ){
            log( this.name() + ": anyFalse:" + anyFalse + ": since some are false, I can not be true");
            ret |= this.remove(true);
        }
        if( allTrue ){
            log( this.name() + ": allTrue:" + allTrue + ": since all are true, I can not be false" );
            ret |= this.remove(false);
        }
        return ret;
    },

    reduceObservedDomain: function(){
        var cps = this.observed();
        var log = function(){};
        
        if( this.isTrue() ){
            log( this.name() + ": since I am true, all my observed can not be false");
            var ret = false;
            for( var i = 0 ; i < cps.length ; i++ ){
                ret |= cps[i].remove(false);
            }
            return ret;
        }

        if( this.isFalse() ){
            log( this.name() + ": since I am false, at least one of my observed can not be true");

            // if only one cp can be false, it should be false
            var undefinedCP = undefined;
            var numberOfTrue = 0;
            for( var i = 0 ; i < cps.length ; i++ ){
                var cp = cps[i];
                log( "  " + cp.toString() );
                if( cp.isTrue() ){
                    log( "  " + cp.toString() + " is true");
                    numberOfTrue += 1;
                }
                if( !cp.defined() ){
                    log( "  " + cp.toString() + " is not defined");
                    undefinedCP = cp;
                }
            }
            var ret = false;
            if( numberOfTrue == cps.length - 1 && undefinedCP ){
                log( "  " + this.name() + ": only " + undefinedCP.name() + "(defined:" + undefinedCP.defined() + ") can be false, so removed true from it" );
                ret = undefinedCP.remove(true);
            }
            return ret;
        }
    }
});


CP.Boolean = function(name){ return new CPBoolean(name); };
//CP.And = function(cps){ return new CPAnd(cps); };
CP.And = function(cps){ return new CPNumberTrue(cps,cps.length)};
CP.Not = function(cp){ return new CPNot(cp); };
CP.SomeTrue = function(cps,number){ return new CPNumberTrue(cps,number); };
CP.Or = function(cps){
    var negatedCPS = [];
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        negatedCPS.push( CP.Not(cps[i]) );
        names += cps[i].name() + " ";
    }
    var ret =  CP.Not( CP.And(negatedCPS) );
    ret.name = function(){ return "Or(" + names + ")"; };
    return ret;
};



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

            andAB.describe();

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


        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            a.remove(false);

            assert(orAB.isTrue());
        },


        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(true);

            assert(a.isFalse());
            assert(b.isFalse());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(false);
            b.remove(true);

            orAB.describe();

            assert(a.isTrue());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var and = CP.And([a,b,c]);
            and.remove(false);
            assert(a.isTrue());
            assert(b.isTrue());
            assert(c.isTrue());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var or = CP.Or([a,b,c]);
            or.remove(true);
            assert(a.isFalse());
            assert(b.isFalse());
            assert(c.isFalse());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var or = CP.Or([a,b,c]);
            or.remove(false);
            a.remove(true);
            b.remove(true);

            or.describe();
            
            assert(a.isFalse());
            assert(b.isFalse());
            assert(c.isTrue());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            var st = CP.SomeTrue([a,b,c,d],2);

            st.describe();

            a.remove(true);
            st.describe();

            b.remove(true);
            st.describe();

            c.remove(true);

            st.describe();
            
            assert(st.isFalse());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            var st = CP.SomeTrue([a,b,c,d],2);

            a.remove(true);
            b.remove(true);
            st.remove(false);

            st.describe();
            
            assert(c.isTrue());
            assert(d.isTrue());
        }


        
        
    ];


    
    for( var i = 0 ; i < tests.length ; i++ ){
        console.log( "----- Test " + i );
        tests[i]();
    }
    
    
}

test();
